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
		Article:require('../models/Article')
	},
	mappings:{
		User:require('../mappings/User')
	}
};

module.exports.convertFrom = function*(p_document) {
	let author = yield* lib.mappings.User.findById(p_document.author.toString());

	return new lib.models.Article({
		id:p_document._id.toString(),
		author:author,
		date:p_document.date,
		title:p_document.title,
		tags:p_document.tags,
		text:p_document.text
	});
};

module.exports.convertTo = function*(p_instance) {
	let dbArticle = {
		author:p_instance.author.id,
		date:p_instance.date,
		title:p_instance.title,
		tags:Array.from(p_instance.tags),
		text:p_instance.text
	};

	if(p_instance.id) {
		dbArticle._id = new lib.deps.mongoDb.ObjectID(p_instance.id);
	}

	return dbArticle;
};

module.exports.findById = function*(p_id) {
	let dbCollectionArticle = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'article');
	let dbArticle = yield lib.odin.util.promise.ninvoke(dbCollectionArticle, 'findOne', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});

	if(!dbArticle) {
		throw new lib.odin.Exception('Unknown article');
	}

	return yield* module.exports.convertFrom(dbArticle);
};

module.exports.search = function*(p_criterias, p_page, p_size) {
	let criterias = {};

	if(p_criterias.author) { criterias.author = new lib.deps.mongoDb.ObjectID(p_criterias.author); }
	if(p_criterias.from) { if(!criterias.date) { criterias.date = {}; } criterias.date.$gte = p_criterias.from; }
	if(p_criterias.to) { if(!criterias.date) { criterias.date = {}; } criterias.date.$lte = p_criterias.to; }
	if(p_criterias.title) { criterias.title = {$regex:p_criterias.title, $options:'i'}; }
	if(p_criterias.tag) { criterias.tags = p_criterias.tag; }

	let dbCollectionArticle = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'article');
	let dbArticles = yield lib.odin.util.promise.ninvoke(
		dbCollectionArticle
			.find(criterias)
			.sort({date:1})
			.skip(p_page * p_size)
			.limit(p_size),
		'toArray'
	);

	let articles = [];
	for(let dbArticle of dbArticles) {
		let article = yield* module.exports.convertFrom(dbArticle);
		articles.push(article);
	}

	return articles;
};

module.exports.create = function*(p_article) {
	let dbCollectionArticle = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'article');
	let dbArticle = yield* module.exports.convertTo(p_article);
	let dbKeys = yield lib.odin.util.promise.ninvoke(dbCollectionArticle, 'insert', dbArticle);

	p_article.id = dbKeys._id.toString();
};

module.exports.modify = function*(p_article, p_modifications) {
	let fields = new Set();
	for(let key in p_modifications) {
		if(p_modifications[key]) {
			p_article[key] = p_modifications[key];
			fields.add(key);
		}
	}

	if(!fields.size) {
		return;
	}

	let dbArticle = yield* module.exports.convertTo(p_article);
	let clause = {$set:{}};

	if(fields.has('title')) { clause.$set.title = dbArticle.title; }
	if(fields.has('tags')) { clause.$set.tags = dbArticle.tags; }
	if(fields.has('text')) { clause.$set.text = dbArticle.text; }

	let dbCollectionArticle = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'article');
	yield lib.odin.util.promise.ninvoke(dbCollectionArticle, 'update', {
		_id:dbArticle._id
	}, clause);
};

module.exports.remove = function*(p_id) {
	let dbCollectionArticle = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'article');
	yield lib.odin.util.promise.ninvoke(dbCollectionArticle, 'remove', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});
};