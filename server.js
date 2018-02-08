"use strict";

var core = require('gtl-core');
var path = require('path');

var components = [

	// interacting with the mongo database
	{
		name: 'storage',
		module: require('gtl-storage')
	},

	// the email module
	{
		name: 'mailer',
		module: require('gtl-mailer'),
		config: {
			templateDir: path.join(__dirname, 'lib/email/views')
		}
	},

	// email notifications
	{
		name: 'email',
		module: require('./lib/email')
	},

	// user
	{
		name: 'user',
		module: require('./lib/user')
	},

	// below here has to do with actual requests, managing sessions, connecting front end (angular) to api (node)
	{
		name: 'cors',
		module: require('gtl-cors')
	},

	{
		name: 'session',
		module: require('gtl-session')
	},

	{
		name: 'rpc',
		module: require('gtl-rpc'),
		config: {
			pathToLib: path.join(__dirname, 'lib/rpc/lib'),
			pathToDocs: path.join(__dirname, 'lib/rpc/rpc.json'),
			authorize: function(request, done) {

				switch (request.getMethod()) {

					// public methods
					case 'email.sendNoResumeEmails':
					case 'promo-code.getPublicPromoCodes':
					case 'promo-code.validate':
					case 'reset-password.resetPassword':
					case 'reset-password.sendResetEmail':
					case 'resume.getResumeById':
					case 'resume.saveResume':
					case 'template.searchTemplates':
					case 'user.authenticate':
					case 'user.create':
						done(true);
						break;

					// default to ensuring there is a user
					default:
						done(request.getAgent() !== null);
						break;
				}
			}
		}
	},
	{
		name: 'routes',
		module: require('gtl-routes')
	},
	{
		name: 'server',
		module: require('gtl-server')
	}
];

core.initDaemonix({
	pathToPackage: path.join(__dirname, 'package.json'),
	pathToConfig: path.join(__dirname, './env'),
	components: components
});
