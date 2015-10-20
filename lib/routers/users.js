'use strict';

/**
	@module		routers/users
	@desc		Router attached to the [/users] URI.
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

let VALIDATOR_LIST_FIRST_NAME = lib.deps.joi.string().min(1).max(40);
let VALIDATOR_LIST_LAST_NAME = lib.deps.joi.string().min(1).max(40);

/**
	@private
	@desc									Tells whether the provided request can obtain full access to user info or not.
	@param {http.Request} p_request			The request to evaluate.
	@param {String} p_right					The specific right to check.
	@returns {Boolean}						The authorization state for the provided request.
*/
function canHaveFullAccess(p_request, p_right) {
	return p_request.session.rights.has(p_right) || p_request.params.user == p_request.session.data.user.id;
}

/**
	@private
	@desc										Restrain the request to authorized sessions or ensure that the request session user is the same as the requested user.
	@param {http.Request} p_request				The request to restrain.
	@param {String} p_right						The specific right to check.
	@throws {module:odin/http.ExceptionRest}	403 "auth.insufficientRights" if the conditions are not met.
*/
function filterByUser(p_request, p_right) {
	if(!canHaveFullAccess(p_request, p_right)) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@api										{get} /users?page=:page&size=:size
	@apiName									users.list
	@apiGroup									users
	@apiPermission								users.list
	@apiDescription								Returns a paginated users list.
	@apiParam query {Number} [page]				Page number (starts at 0).
	@apiParam query {Number} [size]				Page size.
	@apiParam query {String} [firstName]		Term checked against the users first name to narrow the results list.
	@apiParam query {String} [lastName]			Term checked against the users last name to narrow the results list.

	@apiSuccess {Object[]} users				Paginated users list.
	@apiSuccess {String} users.id				User id.
	@apiSuccess {String} users.firstName		User first name.
	@apiSuccess {String} users.lastName			User last name.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{"id":"a569d5e1f8a41c551acc", "email":"jane.doe@domain.com", "firstName":"Jane", "lastName":"Doe"},
			{"id":"de25901340ab10222ef6", "email":"john.doe@domain.com", "firstName":"John", "lastName":"Doe"}
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
	p_request.checkSessionRight('users.list');
	p_request.validatePagination();
	p_request.validate({
		query:{
			firstName:VALIDATOR_LIST_FIRST_NAME,
			lastName:VALIDATOR_LIST_LAST_NAME
		}
	});

	return lib.deps.co(function*() {
		let users = yield* lib.mappings.User.search({
			firstName:p_request.query.firstName,
			lastName:p_request.query.lastName
		}, p_request.query.page, p_request.query.size);

		let list = [];
		for(let user of users) {
			list.push({
				id:user.id,
				email:user.email,
				firstName:user.firstName,
				lastName:user.lastName
			});
		}

		return p_response.send(list);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{post} /users
	@apiName									users.create
	@apiGroup									users
	@apiPermission								users.create
	@apiDescription								Creates a new user.
	@apiParam body {String} email				User email.
	@apiParam body {String} password			User password.
	@apiParam body {String} firstName			User first name.
	@apiParam body {String} lastName			User last name.
	@apiParam body {Array.<String>} rights		User rights.

	@apiSuccess {String} id						User id.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			id:'25fde3b96a'
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (409) duplicate					If the user already exists (constraints violation).
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"validation",
			"message":"Validation error"
		}
*/
function create(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.checkSessionRight('users.create');

	let user;
	try {
		user = new lib.models.User({
			email:p_request.body.email,
			password:lib.models.User.hashPassword(p_request.body.password),
			firstName:p_request.body.firstName,
			lastName:p_request.body.lastName,
			rights:p_request.body.rights
		});
	} catch(p_ex) {
		throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', p_ex.details);
	}

	return lib.deps.co(function*() {
		try {
			yield* lib.mappings.User.create(user);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(409, 'duplicate', 'User already exists');
		}

		return p_response.send({
			id:user.id
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{get} /users/:user
	@apiName									users.view
	@apiGroup									users
	@apiDescription								Returns info about an user.
												The user requires the right [users.view] to view full info about another user.
												If not, only partial info will be returned.
	@apiParam params {String} user				User id.

	@apiSuccess {Object} 						User configuration set.
	@apiSuccess {String} id						User id.
	@apiSuccess {String} [email]				User email. For authorized users only.
	@apiSuccess {String} firstName				User first name.
	@apiSuccess {String} lastName				User last name.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"id":"25fde3b96a",
			"email":"user@domain.com",
			"firstName":"Jane",
			"lastName":"Doe"
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested user doesn't exist.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"notFound",
			"message":"Unknown user"
		}
*/
function view(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validate({
		params:{
			user:lib.models.User.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		let user;
		try {
			user = yield* lib.mappings.User.findById(p_request.params.user);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Unknown user');
		}

		let info = {
			id:user.id,
			firstName:user.firstName,
			lastName:user.lastName
		};

		if(canHaveFullAccess(p_request, 'users.view')) {
			info.email = user.email;
		}

		return p_response.send(info);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api											{post} /users/:user
	@apiName										users.modify
	@apiGroup										users
	@apiDescription									Modifies an user.
													The user requires the right [users.modify] to modify another user.
	@apiParam params {String} id					User id.
	@apiParam body {String} [email]					User email.
	@apiParam body {String} [password]				User password.
	@apiParam body {String} [firstName]				User firstName.
	@apiParam body {String} [lastName]				User lastName.
	@apiParam body {Array.<String>} [rights]		User rights.

	@apiSuccessExample {json}
		HTTP/1.0 200 OK

	@apiError (401) auth.missingToken				If no session token is provided in the authorization header.
	@apiError (409) auth.validation					If the auth session token is malformed.
	@apiError (401) auth.unknownSession				If the session isn't active any more.
	@apiError (403) auth.insufficientRights			If the session has insufficient rights or the requested user doesn't match the session user.
	@apiError (409) validation						If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound						If the requested user doesn't exist.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
function modify(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validate({
		params:{
			user:lib.models.User.VALIDATOR_ID.required()
		}
	});

	filterByUser(p_request, 'users.modify');

	return lib.deps.co(function*() {
		let user;
		try {
			user = yield* lib.mappings.User.findById(p_request.params.user);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Unknown user');
		}

		try {
			yield* lib.mappings.User.modifiy(user, {
				email:p_request.body.email,
				password:p_request.body.password,
				firstName:p_request.body.firstName,
				lastName:p_request.body.lastName,
				rights:p_request.body.rights
			});
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', {details:p_ex.details});
		}

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{delete} /users/:user
	@apiName									users.remove
	@apiGroup									users
	@apiPermission								users.remove
	@apiDescription								Removes an user.
	@apiParam params {String} user				User id.

	@apiSuccessExample {json}
		HTTP/1.0 200 OK

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
function remove(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.checkSessionRight('users.remove');
	p_request.validate({
		params:{
			user:lib.models.User.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		yield* lib.mappings.User.remove(p_request.params.user);

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@desc			Initializes the users router.
	@param p_api	The parent API router.
*/
module.exports.init = function(p_api) {
	let router = p_api.route('/users');

	router.get('/', list);
	router.post('/', create);
	router.get('/:user', view);
	router.post('/:user', modify);
	router.delete('/:user', remove);
};