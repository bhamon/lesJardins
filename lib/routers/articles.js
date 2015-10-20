'use strict';

/**
	@module		routers/articles
	@desc		Router attached to the [/articles] URI.
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
		Article:require('../models/Article'),
		ArticleComment:require('../models/ArticleComment')
	},
	mappings:{
		Article:require('../mappings/Article'),
		ArticleComment:require('../mappings/ArticleComment')
	}
};

/**
	@private
	@desc										Restrain the request to authorized session or ensure that the request session user is the same as the article author.
	@param {http.Request} p_request				The request to restrain.
	@param {String} p_right						The specific right to check.
	@param {models.Article} p_article			Article.
	@throws {module:odin/http.ExceptionRest}	403 "auth.insufficientRights" if the conditions are not met.
*/
function filterByAuthor(p_request, p_right, p_article) {
	if(!p_request.session.rights.has(p_right) && p_article.author.id != p_request.session.data.user.id) {
		throw new lib.odin.http.ExceptionRest(403, 'auth.insufficientRights', 'Insufficient rights');
	}
}

/**
	@api												{get} /articles?page=:page&size=:size
	@apiName											articles.list
	@apiGroup											articles
	@apiDescription										Returns a paginated articles list.
	@apiParam query {Number} [page]						Page number (starts at 0).
	@apiParam query {Number} [size]						Page size.
	@apiParam query {String} [author]					Narrows the results list to the articles with the specified author id.
	@apiParam query {String} [from]						Narrows the results list to the articles created after the specified date.
	@apiParam query {String} [to]						Narrows the results list to the articles created before the specified date.
	@apiParam query {String} [title]					Term checked against the articles title to narrow the results list.
	@apiParam query {String} [tag]						Term checked against the articles tags to narrow the results list.

	@apiSuccess {Object[]} articles						Paginated articles list.
	@apiSuccess {String} articles.id					Article id.
	@apiSuccess {String} articles.author				Article author id.
	@apiSuccess {Date} articles.date					Article creation date.
	@apiSuccess {String} articles.title					Article title.
	@apiSuccess {Array.<String>} articles.tags			Article tags.
	@apiSuccess {String} articles.text					Article text.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{
				"id":"a569d5e1f8a41c551acc",
				"author":"f8a41c551acca569d5e1",
				"date":"2015-10-10T05:31:35.124Z",
				"title":"Test",
				"tags":["council.report"],
				"text":"Here is some text ;)"
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
		let articles = yield* lib.mappings.Article.search({
			author:p_request.query.author,
			from:p_request.query.from,
			to:p_request.query.to,
			title:p_request.query.title,
			tag:p_request.query.tag
		}, p_request.query.page, p_request.query.size);

		let list = [];
		for(let article of articles) {
			list.push({
				id:article.id,
				author:article.author.id,
				date:article.date,
				title:article.title,
				tags:article.tags,
				text:article.text
			});
		}

		return p_response.send(list);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{post} /articles
	@apiName									articles.create
	@apiGroup									articles
	@apiPermission								articles.create
	@apiDescription								Creates a new article.
	@apiParam body {String} title				Article title.
	@apiParam body {Array.<String>} tags		Article tags.
	@apiParam body {String} text				Article text.

	@apiSuccess {String} id						Article id.
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
	p_request.checkSessionRight('articles.create');

	let article;
	try {
		article = new lib.models.Article({
			author:p_request.session.data.user,
			date:new Date(),
			title:p_request.body.title,
			tags:p_request.body.tags,
			text:p_request.body.text
		});
	} catch(p_ex) {
		throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', p_ex.details);
	}

	return lib.deps.co(function*() {
		yield* lib.mappings.Article.create(article);

		return p_response.send({
			id:article.id
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{get} /articles/:article
	@apiName									articles.view
	@apiGroup									articles
	@apiDescription								Returns info about an article.
	@apiParam params {String} article			Article unique id.

	@apiSuccess {String} id						Article id.
	@apiSuccess {String} author					Article author id.
	@apiSuccess {Date} date						Article creation date.
	@apiSuccess {String} title					Article title.
	@apiSuccess {Array.<String>} tags			Article tags.
	@apiSuccess {String} text					Article text.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			"id":"25fde3b96a",
			"author":"e3b965fda2",
			"date":"2015-10-10T05:31:35.124Z",
			"title":"Test article",
			"tags":["report"],
			"text":"Some text here ;)"
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested article doesn't exist.
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
			article:lib.models.Article.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		let article;
		try {
			article = yield* lib.mappings.Article.findById(p_request.params.article);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Article not found');
		}

		return p_response.send({
			id:article.id,
			author:article.author.id,
			date:article.date,
			title:article.title,
			tags:article.tags,
			text:article.text
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{post} /articles/:article
	@apiName									articles.modify
	@apiGroup									articles
	@apiDescription								Modifies an article.
												The user requires the right [articles.modify] to modify the article of another user.
	@apiParam params {String} article			Article unique id.
	@apiParam body {String} [title]				Article title.
	@apiParam body {Array.<String>} [tags]		Article tags.
	@apiParam body {String} [text]				Article text.

	@apiSuccessExample {json}
		HTTP/1.0 200 OK

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (403) auth.insufficientRights		If the session has insufficient rights or the session user isn't the author of the requested article.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested article doesn't exist.
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
			article:lib.models.Article.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		let article;
		try {
			article = yield* lib.mappings.Article.findById(p_request.params.article);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Article not found');
		}

		try {
			yield* lib.mappings.Article.modifiy(article, {
				title:p_request.body.title,
				tags:p_request.body.tags,
				text:p_request.body.text
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
	@api										{delete} /articles/:article
	@apiName									articles.remove
	@apiGroup									articles
	@apiPermission								articles.remove
	@apiDescription								Removes an article.
	@apiParam params {String} article			Article id.

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
		yield* lib.mappings.ArticleComment.removeByArticle(p_request.params.article);
		yield* lib.mappings.Article.remove(p_request.params.article);

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api												{get} /articles/:article/comments?page=:page&size=:size
	@apiName											articles.comments.list
	@apiGroup											articles
	@apiDescription										Returns a paginated comments list for the specified article.
	@apiParam params {String} article					Article unique id.
	@apiParam query {Number} page						Page number (starts at 0).
	@apiParam query {Number} size						Page size.

	@apiSuccess {Object[]} comments						Paginated comments list.
	@apiSuccess {String} comments.id					Comment id.
	@apiSuccess {String} comments.article				Comment article id.
	@apiSuccess {String} comments.author				Comment author id.
	@apiSuccess {Date} comments.date					Comment creation date.
	@apiSuccess {String} comments.text					Comment text.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		[
			{
				"id":"a569d5e1f8a41c551acc",
				"author":"f8a41c551acca569d5e1",
				"date":"2015-10-10T05:31:35.124Z",
				"text":"Goo to hear :p"
			}
		]

	@apiError (401) auth.missingToken					If no session token is provided in the authorization header.
	@apiError (409) auth.validation						If the auth session token is malformed.
	@apiError (401) auth.unknownSession					If the session isn't active any more.
	@apiError (409) validation							If at least one parameter (query, param, body) is malformed.
	@apiErrorExample {json}
		HTTP/1.0 404 Not found
		{
			"type":"article.notFound",
			"message":"Article not found"
		}
*/
function listComments(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.validatePagination();

	return lib.deps.co(function*() {
		let articleComments = yield* lib.mappings.ArticleComment.search({
			article:p_request.params.article
		}, p_request.query.page, p_request.query.size);

		let list = [];
		for(let articleComment of articleComments) {
			list.push({
				id:articleComment.id,
				article:articleComment.article.id,
				author:articleComment.author.id,
				date:articleComment.date,
				text:articleComment.text
			});
		}

		return p_response.send(list);
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{post} /articles/:article/comments
	@apiName									articles.comments.create
	@apiGroup									articles
	@apiDescription								Creates a new comment for the specified article.
	@apiParam params {String} article			Article id.
	@apiParam body {String} text				Comment text.

	@apiSuccess {String} id						Comment id.
	@apiSuccessExample {json}
		HTTP/1.0 200 OK
		{
			id:'25fde3b96a'
		}

	@apiError (401) auth.missingToken			If no session token is provided in the authorization header.
	@apiError (409) auth.validation				If the auth session token is malformed.
	@apiError (401) auth.unknownSession			If the session isn't active any more.
	@apiError (409) validation					If at least one parameter (query, param, body) is malformed.
	@apiError (404) notFound					If the requested article doesn't exist.
	@apiErrorExample {json}
		HTTP/1.0 409 Conflict
		{
			"type":"validation",
			"message":"Validation error"
		}
*/
function createComment(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);

	return lib.deps.co(function*() {
		let article;
		try {
			article = yield* lib.mappings.Article.findById(p_request.params.article);
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(404, 'notFound', 'Article not found');
		}

		let articleComment;
		try {
			articleComment = new lib.models.ArticleComment({
				article:article,
				author:p_request.session.data.user,
				date:new Date(),
				title:p_request.body.title,
				tags:p_request.body.tags,
				text:p_request.body.text
			});
		} catch(p_ex) {
			throw new lib.odin.http.ExceptionRest(409, 'validation', 'Validation error', p_ex.details);
		}

		yield* lib.mappings.ArticleComment.create(articleComment);

		return p_response.send({
			id:articleComment.id
		});
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@api										{delete} /articles/:article/comments/:comment
	@apiName									articles.comments.remove
	@apiGroup									articles
	@apiPermission								articles.comments.remove
	@apiDescription								Removes a comment.
	@apiParam params {String} article			Article id.
	@apiParam params {String} comment			Comment id.

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
function removeComment(p_request, p_response, p_next) {
	p_request.initSession(lib.registry.sessionStore);
	p_request.checkSessionRight('articles.comments.remove');
	p_request.validate({
		params:{
			article:lib.models.Article.VALIDATOR_ID.required(),
			comment:lib.models.ArticleComment.VALIDATOR_ID.required()
		}
	});

	return lib.deps.co(function*() {
		yield* lib.mappings.ArticleComment.remove(p_request.params.article, p_request.params.comment);

		return p_response.status(200).end();
	})
	.catch(function(p_error) {
		return p_next(p_error);
	});
}

/**
	@desc			Initializes the articles router.
	@param p_api	The parent API router.
*/
module.exports.init = function(p_api) {
	let router = p_api.route('/articles');

	router.get('/', list);
	router.post('/', create);
	router.get('/:article', view);
	router.post('/:article', modify);
	router.delete('/:article', remove);
	router.get('/:article/comments', listComments);
	router.post('/:article/comments', createComment);
	router.delete('/:article/comments/:comment', removeComment);
};