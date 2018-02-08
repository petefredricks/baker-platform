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
				this.UserModel.findOne({ phone: phoneKey}, next);
			},

			(userDoc, next) => {

				if (!userDoc) {
					next();
					return;
				}

				const lastLogin = moment(userDoc.lastLogin);
				const now = new Date();

				if (lastLogin.add(5,  'minutes').isBefore(now)) {
					userDoc.update(
						{
							lastLogin: now,
							$inc: { points: 20 }
						},
						(err) => {
							next(err, utils.transformResults(userDoc));
						});
				}
				else {
					next(null, utils.transformResults(userDoc));
				}
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
			email: params.email,
			lastLogin: now,
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
					(err, user) => {
						next(err, utils.transformResults(user));
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