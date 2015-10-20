'use strict';

/**
	@module		routers/channels
	@desc		Router attached to the [/channels] URI.
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
		Channel:require('../models/Channel'),
		ChannelMessage:require('../models/ChannelMessage')
	},
	mappings:{
		Channel:require('../mappings/Channel'),
		ChannelMessage:require('../mappings/ChannelMessage')
	}
};

/**
	@private
	@desc										Restrain the request to authorized session or ensure that the request session user is the same as the channel owner.
	@param {http.Request} p_request				The request to restrain.
	@param {String} p_right						The specific right to check.
	@param {models.Channel} p_channel			Channel.
	@throws {module:odin/http.ExceptionRest}	403 "auth.insufficientRights" if the conditions are not met.
*/
function filterByOwner(p_request, p_right, p_channel) {
	if(!p_request.session.rights.has(p_right) && p_channel.owner.id != p_request.session.data.user.id) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@private
	@desc										Restrain the request to authorized session or ensure that the request session user is in the channel owner or in the channel members list.
	@param {http.Request} p_request				The request to restrain.
	@param {String} p_right						The specific right to check.
	@param {models.Channel} p_channel			Channel.
	@throws {module:odin/http.ExceptionRest}	403 "auth.insufficientRights" if the conditions are not met.
*/
function filterByMember(p_request, p_right, p_channel) {
	if(!p_request.session.rights.has(p_right) && (p_channel.owner.id != p_request.session.data.user.id || p_channel.hasMember(p_request.session.data.user))) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@api												{get} /channels?page=:page&size=:size
	@apiName											channels.list
	@apiGroup											channels
	@apiDescription										Returns a paginated channels list.
														Requires the [channels.list] right to view all the channels (even if not a member).
	@apiParam query {Number} [page]						Page number (starts at 0).
	@apiParam query {Number} [size]						Page size.
	@apiParam query {Number} [owner]					Narrows the results list to the channels with the specified owner id.
	@apiParam query {Number} [from]						Narrows the results list to the channels created after the specified date.
	@apiParam query {Number} [to]						Narrows the results list to the channels created before the specified date.
	@apiParam query {Number} [title]					Term checked against the channels title to narrow the results list.
	@apiParam query {Number} [tag]						Term checked against the channels tags to narrow the results list.

	@apiSuccess {Object[]} channels						Paginated channels list.
	@apiSuccess {String} channels.id					Channel id.
	@apiSuccess {Object} channels.owner					Channel owner id.
	@apiSuccess {Date} channels.date					Channel creation date.
	@apiSuccess {String} channels.title					Channel title.
	@apiSuccess {Array.<String>} channels.tags			Channel tags.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{
				"id":"a569d5e1f8a41c551acc",
				"owner":"f8a41c551acca569d5e1",
				"date":"2015-10-10T05:31:35.124Z",
				"title":"Test",
				"tags":["garden"]
			}
		]

	@apiError (401) auth.missingToken					If no session token is provided in the authorization header.
	@apiError (409) auth.validation						If the auth session token is malformed.
	@apiError (401) auth.unknownSession					If the session isn't active any more.
	@apiError (409) validation							If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
function list(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validatePagination();

	return lib.deps.co(function*() {
		let criterias = {};
		if(!p_request.session.rights.has('channels.list')) {
			criterias.member = p_request.session.data.user.id;
		}

		let channels = yield* lib.mappings.Channel.search(Object.assign(criterias, {
			owner:p_request.query.owner,
			from:p_request.query.from,
			to:p_request.query.to,
			title:p_request.query.title,
			tag:p_request.query.tag
		}), p_request.query.page, p_request.query.size);

		let list = [];
		for(let channel of channels) {
			list.push({
				id:channel.id,
				owner:channel.owner.id,
				date:channel.date,
				title:channel.title,
				tags:channel.tags
			});
		}

		return p_response.send(list);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{post} /channels
	@apiName									channels.create
	@apiGroup									channels
	@apiPermission								channels.create
	@apiDescription								Creates a new channel.
	@apiParam body {String} title				Channel title.
	@apiParam body {String} summary				Channel summary.
	@apiParam body {Array.<String>} tags		Channel tags.

	@apiSuccess {String} id						Channel id.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			id:'25fde3b96a'
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"validation",
			"message":"Validation error"
		}
*/
function create(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.checkSessionRight('channels.create');

	let channel;
	try {
		channel = new lib.models.Channel({
			owner:p_request.session.data.user,
			date:new Date(),
			title:p_request.body.title,
			summary:p_request.body.summary,
			tags:p_request.body.tags
		});
	} catch(p_ex) {
		throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', p_ex.details);
	}

	return lib.deps.co(function*() {
		yield* lib.mappings.Channel.create(channel);

		return p_response.send({
			id:channel.id
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{get} /channels/:channel
	@apiName									channels.view
	@apiGroup									channels
	@apiDescription								Returns info about a channel.
												Requires the [channels.view] right to view channels info without the member restriction.
	@apiParam params {String} channel			Channel id.

	@apiSuccess {String} id						Channel id.
	@apiSuccess {String} owner					Channel owner id.
	@apiSuccess {Date} date						Channel creation date.
	@apiSuccess {String} title					Channel title.
	@apiSuccess {String} summary				Channel summary.
	@apiSuccess {Array.<String>} tags			Channel tags.
	@apiSuccess {Array.<String>} members		Channel members.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"id":"25fde3b96a",
			"owner":"e3b965fda2",
			"date":"2015-10-10T05:31:35.124Z",
			"title":"General",
			"summary":"General informations"
			"tags":["report"],
			"members":["f582b5adc"]
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights or the session user isn't in the channel members.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested channel doesn't exist.
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
			channel:lib.models.Channel.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		let channel;
		try {
			channel = yield* lib.mappings.Channel.findById(p_request.params.channel);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Channel not found');
		}

		yield* lib.mappings.Channel.populateMembers(channel);
		filterByMember(p_request, 'channels.view', channel);

		return p_response.send({
			id:channel.id,
			owner:channel.owner.id,
			date:channel.date,
			title:channel.title,
			summary:channel.summary,
			tags:channel.tags,
			members:Array.from(channel.members).map(function(p_member) {
				return p_member.id;
			})
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api											{post} /channels/:channel
	@apiName										channels.modify
	@apiGroup										channels
	@apiDescription									Modifies a channel.
													The user requires the right [channels.modify] to modify the channel owned by another user.
	@apiParam params {String} id					Channel unique id.
	@apiParam body {String} [title]					Channel title.
	@apiParam body {String} [summary]				Channel summary.
	@apiParam body {Array.<String>} [tags]			Channel tags.
	@apiParam body {Array.<String>} [members]		Channel members.

	@apiSuccessExample {json}
		HTTP/1.0 200 OK

	@apiError (401) auth.missingToken				If no session token is provided in the authorization header.
	@apiError (409) auth.validation					If the auth session token is malformed.
	@apiError (401) auth.unknownSession				If the session isn't active any more.
	@apiError (403) auth.insufficientRights			If the session has insufficient rights or the session user isn't the owner of the requested article.
	@apiError (409) validation						If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound						If the requested channel doesn't exists.
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
			channel:lib.models.Channel.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		let channel;
		try {
			channel = yield* lib.mappings.Channel.findById(p_request.params.channel);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Channel not found');
		}

		filterByOwner(p_request, 'channels.modify', channel);

		yield* lib.mappings.Channel.modify(channel, {
			title:p_request.body.title,
			summary:p_request.body.summary,
			tags:p_request.body.tags,
			members:p_request.body.members
		});

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{delete} /channels/:channel
	@apiName									channels.remove
	@apiGroup									channels
	@apiPermission								channels.remove
	@apiDescription								Removes a channel.
	@apiParam params {String} channel			Channel id.

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
	p_request.checkSessionRight('articles.remove');
	p_request.validate({
		params:{
			article:lib.models.Article.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		yield* lib.mappings.ChannelMessage.removeByChannel(p_request.params.channel);
		yield* lib.mappings.Channel.remove(p_request.params.channel);

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api												{get} /channels/:channel/messages?page=:page&size=:size
	@apiName											channels.messages.list
	@apiGroup											channels
	@apiDescription										Returns a paginated messages list for the specified channel.
														Requires the [channels.messages.list] right to view channels messages without the member restriction.
	@apiParam params {String} channel					Channel id.
	@apiParam params {Number} page						Page number (starts at 0).
	@apiParam params {Number} size						Page size.

	@apiSuccess {Object[]} messages						Paginated messages list.
	@apiSuccess {String} messages.id					Message id.
	@apiSuccess {Object} messages.author				Message author id.
	@apiSuccess {Date} messages.date					Message creation date.
	@apiSuccess {String} messages.text					Message text.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{
				"id":"a569d5e1f8a41c551acc",
				"author":"f8a41c551acca569d5e1",
				"date":"2015-10-10T05:31:35.124Z",
				"text":"Good to hear :p"
			}
		]

	@apiError (401) auth.missingToken					If no session token is provided in the authorization header.
	@apiError (409) auth.validation						If the auth session token is malformed.
	@apiError (401) auth.unknownSession					If the session isn't active any more.
	@apiError (409) validation							If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound							If the requested channel doesn't exists.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"auth.insufficientRights",
			"message":"Insufficient rights"
		}
*/
let listMessages = function(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validatePagination();

	return lib.deps.co(function*() {
		let channel;
		try {
			channel = yield* lib.mappings.Channel.findById(p_request.params.channel);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Channel not found');
		}

		yield* lib.mappings.Channel.populateMembers(channel);
		filterByMember(p_request, 'channels.messages.list', channel);

		let messages = yield* lib.mappings.ChannelMessage.search({
			channel:p_request.params.channel
		}, p_request.query.page, p_request.query.size);

		let list = [];
		for(let message of messages) {
			list.push({
				id:message.id,
				author:message.author.id,
				date:message.date,
				text:message.text
			});
		}

		return p_response.send(list);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
};

/**
	@api										{post} /channels/:channel/messages
	@apiName									channels.messages.create
	@apiGroup									channels
	@apiDescription								Creates a new message for the specified channel.
												Requires the [channels.messages.create] right to create a new message without the member restriction.
	@apiParam params {String} channel			Channel id.
	@apiParam body {String} text				Channel text.

	@apiSuccess {String} id						Channel id.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			id:'25fde3b96a'
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested channel doesn't exists.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"validation",
			"message":"Validation error"
		}
*/
let createMessage = function(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);

	return lib.deps.co(function*() {
		let channel;
		try {
			channel = yield* lib.mappings.Channel.findById(p_request.params.channel);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Channel not found');
		}

		yield* lib.mappings.Channel.populateMembers(channel);
		filterByMember(p_request, 'channels.messages.create', channel);

		let channelMessage;
		try {
			channelMessage = new lib.models.ChannelMessage({
				channel:channel,
				author:p_request.session.data.user,
				date:new Date(),
				text:p_request.body.text
			});
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', p_ex.details);
		}

		yield* lib.mappings.ChannelMessage.create(channelMessage);

		return p_response.send({
			id:channelMessage.id
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
};

/**
	@desc			Initializes the channels router.
	@param p_api	The parent API router.
*/
module.exports.init = function(p_api) {
	let router = p_api.route('/channels');

	router.get('/', list);
	router.post('/', create);
	router.get('/:channel', view);
	router.post('/:channel', modify);
	router.delete('/:channel', remove);
	router.get('/:channel/messages', listMessages);
	router.post('/:channel/messages', createMessage);
};