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
		ChannelMessage:require('../models/ChannelMessage')
	},
	mappings:{
		User:require('../mappings/User'),
		Channel:require('../mappings/Channel')
	}
};

module.exports.convertFrom = function*(p_document) {
	let channel = yield* lib.mappings.Channel.findById(p_document.channel.toString());
	let author = yield* lib.mappings.User.findById(p_document.author.toString());

	return new lib.models.ArticleComment({
		id:p_document._id.toString(),
		channel:channel,
		author:author,
		date:p_document.date,
		text:p_document.text
	});
};

module.exports.convertTo = function*(p_instance) {
	let dbChannelMessage = {
		channel:p_instance.channel.id,
		author:p_instance.author.id,
		date:p_instance.date,
		text:p_instance.text
	};

	if(p_instance.id) {
		dbChannelMessage.id = new lib.deps.mongoDb.ObjectID(p_instance.id);
	}

	return dbChannelMessage;
};

module.exports.search = function*(p_criterias, p_page, p_size) {
	let criterias = {};

	if(p_criterias.channel) { criterias.channel = new lib.deps.mongoDb.ObjectID(p_criterias.channel); }

	let dbCollectionChannelMessage = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channelMessage');
	let dbChannelMessages = yield lib.odin.util.promise.ninvoke(
		dbCollectionChannelMessage
			.find(criterias)
			.sort({date:1})
			.skip(p_page * p_size)
			.limit(p_size),
		'toArray'
	);

	let channelMessages = [];
	for(let dbChannelMessage of dbChannelMessages) {
		let channelMessage = yield* module.exports.convertFrom(dbChannelMessage);
		channelMessages.push(channelMessage);
	}

	return channelMessages;
};

module.exports.create = function*(p_channelMessage) {
	let dbCollectionChannelMessage = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channelMessage');
	let dbChannelMessage = yield* module.exports.convertTo(p_channelMessage);
	let dbKeys = yield lib.odin.util.promise.ninvoke(dbCollectionArticleComment, 'insert', dbChannelMessage);

	p_channelMessage.id = dbKeys._id.toString();
};

module.exports.removeByChannel = function*(p_id) {
	let dbCollectionChannelMessage = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channelMessage');
	yield lib.odin.util.promise.ninvoke(dbCollectionChannelMessage, 'remove', {
		channel:new lib.deps.mongoDb.ObjectID(p_id)
	});
};