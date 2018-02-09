"use strict";

const utils = require('gtl-utils');

module.exports = function(Schema) {

	var User = Schema({
		checkIns: { type: Number },
		created: { type: Date },
		email: { type: String },
		lastPointCheckIn: { type: Date },
		nameFirst: { type: String },
		nameLast: { type: String },
		phone: {
			type: String,
			lowercase: true,
			unique: true
		},
		points: { type: Number }
	});

	utils.mongooseExtendOptions(User);

	return User;
};