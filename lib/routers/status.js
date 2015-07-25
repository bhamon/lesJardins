'use strict';

/**
	@module		routers/status
	@desc		Router attached to the [/status] URI.
*/

var lib = {
	registry:require('../registry')
};

/**
	@api										{get} /status
	@apiName									status
	@apiDescription								Returns this node status.

	@apiSuccess {String} version				Node version number.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"version":"0.1.0"
		}
*/
var status = function(p_request, p_response, p_next) {
	return p_response.send({
		version:lib.registry.info.version
	});
};

/**
	@desc			Initializes the status router.
	@param p_api	The parent API router.
*/
module.exports.init = function(p_api) {
	p_api.get('/status', status);
};