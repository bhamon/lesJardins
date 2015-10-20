'use strict';

let lib = {
	deps:{
		mongoDb:require('mongodb')
	},
	odin:{
		Exception:require('odin').Exception,
		util:require('odin').util
	},
	registry:require('../registry'),
	models:{
		ArticleComment:require('../models/ArticleComment')
	},
	mappings:{
		User:require('../mappings/User'),
		Article:require('../mappings/Article')
	}
};

module.exports.convertFrom = function*(p_document) {
	let article = yield* lib.mappings.Article.findById(p_document.article.toString());
	let author = yield* lib.mappings.User.findById(p_document.author.toString());

	return new lib.models.ArticleComment({
		id:p_document._id.toString(),
		article:article,
		author:author,
		date:p_document.date,
		text:p_document.text
	});
};

module.exports.convertTo = function*(p_instance) {
	let dbArticleComment = {
		article:p_instance.article.id,
		author:p_instance.author.id,
		date:p_instance.date,
		text:p_instance.text
	};

	if(p_instance.id) {
		dbArticleComment.id = new lib.deps.mongoDb.ObjectID(p_instance.id);
	}

	return dbArticleComment;
};

module.exports.search = function*(p_criterias, p_page, p_size) {
	let criterias = {};

	if(p_criterias.article) { criterias.article = new lib.deps.mongoDb.ObjectID(p_criterias.article); }

	let dbCollectionArticleComment = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'articleComment');
	let dbArticleComments = yield lib.odin.util.promise.ninvoke(
		dbCollectionArticleComment
			.find(criterias)
			.sort({date:1})
			.skip(p_page * p_size)
			.limit(p_size),
		'toArray'
	);

	let articleComments = [];
	for(let dbArticleComment of dbArticleComments) {
		let articleComment = yield* module.exports.convertFrom(dbArticleComment);
		articleComments.push(articleComment);
	}

	return articleComments;
};

module.exports.create = function*(p_articleComment) {
	let dbCollectionArticleComment = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'articleComment');
	let dbArticleComment = yield* module.exports.convertTo(p_articleComment);
	let dbKeys = yield lib.odin.util.promise.ninvoke(dbCollectionArticleComment, 'insert', dbArticleComment);

	p_articleComment.id = dbKeys._id.toString();
};

module.exports.remove = function*(p_article, p_id) {
	let dbCollectionArticleComment = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'articleComment');
	yield lib.odin.util.promise.ninvoke(dbCollectionArticleComment, 'remove', {
		_id:new lib.deps.mongoDb.ObjectID(p_id),
		article:new lib.deps.mongoDb.ObjectID(p_article)
	});
};

module.exports.removeByArticle = function*(p_id) {
	let dbCollectionArticleComment = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'articleComment');
	yield lib.odin.util.promise.ninvoke(dbCollectionArticleComment, 'remove', {
		article:new lib.deps.mongoDb.ObjectID(p_id)
	});
};