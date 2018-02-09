"use strict";

const _ = require('underscore');
const async = require('async');
const moment = require('moment');
const utils = require('gtl-utils');

var userSchema = require('./models/user-model');

class User {

	constructor(core) {
		let schema = core.get('schema');

		this.core = core;
		this.config = core.get('config').get('app');
		this.emailLib = core.get('email');

		schema.addSchema('User', userSchema);
	}

	init(done) {
		this.mongoose = this.core.get('mongoose');
		this.UserModel = this.mongoose.model('User');

		this.emailLib = this.core.get('email');

		setImmediate(done);
	}

	authenticate(params, done) {
		if (!params || !params.phone) {
			done('[BadParams] must provide user phone');
			return;
		}

		const phoneKey = createPhoneKey(params.phone);

		const tasks = [

			(next) => {
				this.UserModel.findOne({ phone: phoneKey }, next);
			},

			(userDoc, next) => {

				if (!userDoc) {
					next('[BadParams] user does not exist');
					return;
				}

				const lastPointCheckIn = moment(userDoc.lastPointCheckIn);
				const now = new Date();

				// if not enough time as past since last checkin, just return
				if (lastPointCheckIn.add(5,  'minutes').isAfter(now)) {
					next('[Misc] check-in too quickly', utils.transformResults(userDoc));
					return;
				}

				this.UserModel.findByIdAndUpdate(
					userDoc.id,
					{
						lastPointCheckIn: now,
						$inc: {
							checkIns: 1,
							points: 20
						}
					},
					{
						new: true
					},
					next);
			},

			(userDoc, next) => {
				const user = utils.transformResults(userDoc);

				// if everything checks out, send success email
				this.emailLib.sendCheckInEmail(user, _.noop);

				next(null, user);
			}
		];

		async.waterfall(tasks, done);
	}

	create(params, done) {

		if (_.isEmpty(params.phone)) {
			done('[BadParams] must provide phone to create user');
			return;
		}

		if (_.isEmpty(params.email)) {
			done('[BadParams] must provide email to create user');
			return;
		}

		if (_.isEmpty(params.nameFirst) || _.isEmpty(params.nameLast)) {
			done('[BadParams] must provide first and last name to create user');
			return;
		}

		const now = new Date();

		const userData = {
			checkIns: 1,
			email: params.email,
			lastPointCheckIn: now,
			nameFirst: params.nameFirst,
			nameLast: params.nameLast,
			phone: createPhoneKey(params.phone),
			points: 50,
			created: now
		};

		const tasks = [

			(next) => {
				this.findByPhone(userData.phone, function(err, data) {

					if (data) {
						err = '[Conflict] phone number already in use';
					}

					next(err);
				});
			},

			(next) => {
				this.UserModel.create(
					userData,
					(err, userDoc) => {
						const user = utils.transformResults(userDoc);

						// if everything checks out, send success email
						if (!err) {
							this.emailLib.sendCheckInEmail(user, _.noop);
						}

						next(err, user);
					}
				);
			}
		];

		async.waterfall(tasks, done);
	}

	findByPhone(phone, done) {
		if (!phone) {
			done('[BadParams] must provide user phone');
			return;
		}

		phone = createPhoneKey(phone);

		this.UserModel.findOne({ phone: phone}, (err, user) => {
			done(err, utils.transformResults(user));
		});
	}

	getById(id, done) {

		if (!id) {
			done('[BadParams] must provide user id');
			return;
		}

		this.UserModel.findById(id, (err, user) => {
			done(err, utils.transformResults(user));
		});
	}
}

module.exports = User;

// HELPERS

function createPhoneKey(phone) {
	phone = phone.replace(/[^\d]/g, '');

	if (phone.length === 10) {
		phone = '1' + phone;
	}

	return phone;
}