"use strict";

class Email {

	constructor(core) {
		this.core = core;
	}

	init(done) {
		this.mailerLib = this.core.get('mailer');
		setImmediate(done);
	}

	sendCheckInEmail(user, done) {
		this.mailerLib.send(
			{
				template: 'checkin',
				model: user,
				to: user.email
			},
			done
		);
	}
}

module.exports = Email;