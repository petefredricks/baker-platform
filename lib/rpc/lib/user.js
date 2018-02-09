"use strict";

const _ = require('underscore');
const utils = require('gtl-utils');

module.exports = function (core) {

	var userLib = core.get('user');

	module.exports = {
		authenticate: authenticate,
		create: create,
		getProfile: getProfile
	};

	function authenticate(request, response) {
		const params = request.getParams();
		const complete = utils.rpcResponse(response);

		userLib.authenticate(params, (err, user) => {
			let result;

			if (err) {
				result = user;
			}
			else {
				request.getContext().session.agent = {
					id: user.id
				};
				result = { success: true };
			}

			complete(err, result);
		});
	}

	function create(request, response) {
		const params = request.getParams();
		const complete = utils.rpcResponse(response);

		userLib.create(params,
			(err, user) => {

				if (err) {
					complete(err);
					return;
				}

				if (_.isEmpty(user)) {
					complete('unknown error creating user.');
					return;
				}

				request.getContext().session.agent = {
					id: user.id
				};

				complete(null, user);
			}
		);
	}

	function getProfile(request, response) {
		const agent = request.getAgent();
		userLib.getById(agent.id, utils.rpcResponse(response));
	}
};