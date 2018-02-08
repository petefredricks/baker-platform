"use strict";

const utils = require('gtl-utils');

module.exports = function(Schema) {

	var User = Schema({
		created:    { type: Date },
		email:      { type: String },
		lastLogin:  { type: Date },
		nameFirst:  { type: String },
		nameLast:   { type: String },
		phone:      {
			type: String,
			lowercase: true,
			unique: true
		},
		points:     { type: Number }
	});

	// indexes
	User.index({ phone: 1 });

	utils.mongooseExtendOptions(User);

	return User;
};