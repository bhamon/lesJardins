'use strict';

/**
	@module		routers/sessions
	@desc		Router attached to the [/sessions] URI.
*/

let lib = {
	deps:{
		joi:require('joi'),
		co:require('co')
	},
	odin:{
		util:require('odin').util,
		http:{
			ExceptionRest:require('odin-http').ExceptionRest,
			Router:require('odin-http').Router
		}
	},
	registry:require('../registry'),
	models:{
		User:require('../models/User')
	},
	mappings:{
		User:require('../mappings/User')
	}
};

/**
	@private
	@desc										Restrain the request to authorized sessions or ensure that the request session token is the same as the auth session token.
	@param {http.Request} p_request				The request to restrain.
	@param {String} p_right						The specific right to check.
	@throws {module:odin/http.ExceptionRest}	403 "auth.insufficientRights" if the conditions are not met.
*/
function filterBySessionToken(p_request, p_right) {
	if(!p_request.session.rights.has(p_right) && p_request.session.token != p_request.params.token) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@api										{get} /sessions?page=:page&size=:size
	@apiName									sessions.list
	@apiGroup									sessions
	@apiPermission								sessions.list
	@apiDescription								Returns a paginated active sessions list.
	@apiParam params {Number} page				Page number (starts at 0).
	@apiParam params {Number} size				Page size.

	@apiSuccess {Object[]} sessions				Paginated sessions list.
	@apiSuccess {String} sessions.token			Session token.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{"token":"a569d5e1f8a41c551acc"},
			{"token":"54115b515c1656b15b1b"}
		]

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
function list(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.checkSessionRight('sessions.list');
	p_request.validatePagination();

	return p_request.send(
		lib.registry.sessionStore.getPaginatedList(p_request.query.page, p_request.query.size)
		.map(function(p_session) {
			return {
				token:p_session.token
			};
		})
	);
}

/**
	@api										{post} /sessions
	@apiName									sessions.create
	@apiGroup									sessions
	@apiDescription								Creates a new session (user authentication).
	@apiParam body {String} email				User email.
	@apiParam body {String} password			User password.

	@apiSuccess {String} token					Session token.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"token":"25fde3b96a"
		}

	@apiError (409) auth.login					If the authentication fails (wrong email and/or password).
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.login",
			"message":"Invalid email and/or password"
		}
*/
function create(p_request, p_response, p_next) {
	try {
		p_request.initSession(lib.registry.sessionStore);
		return p_request.send({
			token:p_request.session.token
		});
	} catch(p_ex) {
	}

	p_request.validate({
		body:{
			email:lib.models.User.VALIDATOR_EMAIL.required(),
			password:lib.models.User.VALIDATOR_PASSWORD.required()
		}
	});

	return lib.deps.co(function*() {
		let user;
		try {
			user = yield* lib.mappings.User.findByEmailPassword(p_request.body.email, lib.models.User.hashPassword(p_request.body.password));
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(409, 'auth.login', 'Invalid email and/or password');
		}

		let session = yield lib.registry.sessionStore.create();
		for(let right of user.rights) {
			session.rights.add(right);
		}

		session.data.user = user;

		return p_response.send({
			token:session.token
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{get} /sessions/:token
	@apiName									sessions.view
	@apiGroup									sessions
	@apiDescription								Returns info about a session.
												The user requires the right [sessions.view] to view info about a session not owned.
	@apiParam params {String} token				Session token.

	@apiSuccess {String} token					Session token.
	@apiSuccess {Date} creationDate				Session creation date.
	@apiSuccess {Date} lastAccessDate			Session last access date.
	@apiSuccess {String[]} rights				Session rights.
	@apiSuccess {Object} data					Session extra data.
	@apiSuccess {String} data.user				User id.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"token":"25fde3b96a",
			"creationDate":"2012-04-23T18:25:43.511Z",
			"lastAccessDate":"2013-09-01T11:22:10.896Z",
			"rights":["admin"],
			"data":{
				"user":"7eadb12963"
			}
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights or the requested session token doesn't match the provided auth token.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested session doesn't exist.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
function view(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validate({
		params:{
			token:lib.registry.sessionStore.getTokenValidator()
		}
	});

	filterBySessionToken(p_request, 'sessions.view');

	let session = lib.registry.sessionStore.get(p_request.params.token);
	if(!session) {
		throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Unknown session');
	}

	return p_response.send({
		token:session.token,
		creationDate:session.creationDate,
		lastAccessDate:session.lastAccessDate,
		rights:Array.from(session.rights),
		data:{
			user:session.data.user.id
		}
	});
}

/**
	@api										{delete} /sessions/:token
	@apiName									sessions.remove
	@apiGroup									sessions
	@apiDescription								Removes a session.
												The user requires the right [sessions.remove] to remove a session not owned.
	@apiParam params {String} token				Session token.

	@apiSuccessExample {json}
		HTTP/1.0 200 OK

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights or the requested session token doesn't match the provided auth token.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
function remove(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validate({
		params:{
			token:lib.registry.sessionStore.getTokenValidator()
		}
	});

	filterBySessionToken(p_request, 'sessions.remove');

	lib.registry.sessionStore.remove(p_request.params.token);

	return p_response.status(200).end();
}

/**
	@desc			Initializes the sessions router.
	@param p_api	The parent API router.
*/
module.exports.init = function(p_api) {
	let router = p_api.route('/sessions');

	router.get('/', list);
	router.post('/', create);
	router.get('/:token', view);
	router.delete('/:token', remove);
};