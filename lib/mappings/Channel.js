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
		Channel:require('../models/Channel')
	},
	mappings:{
		User:require('../mappings/User')
	}
};

module.exports.convertFrom = function*(p_document) {
	let owner = yield* lib.mappings.User.findById(p_document.owner.toString());

	return new lib.models.Channel({
		id:p_document._id.toString(),
		owner:owner,
		date:p_document.date,
		title:p_document.title,
		summary:p_document.summary,
		tags:p_document.tags
	});
};

module.exports.convertTo = function*(p_instance) {
	let dbChannel = {
		owner:p_instance.owner.id,
		date:p_instance.date,
		title:p_instance.title,
		summary:p_instance.summary,
		tags:Array.from(p_instance.tags),
		members:Array.from(p_instance.members).map(function(p_member) {
			return new lib.deps.mongoDb.ObjectID(p_member.id)
		})
	};

	if(p_instance.id) {
		dbChannel.id = new lib.deps.mongoDb.ObjectID(p_instance.id);
	}

	return dbChannel;
};

module.exports.populateMembers = function*(p_channel) {
	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	let dbChannel = yield lib.odin.util.promise.ninvoke(dbCollectionChannel, 'findOne', {
		_id:new lib.deps.mongoDb.ObjectID(p_channel.id)
	}, {
		members:true
	});

	for(let id of dbChannel.members) {
		let member = yield* lib.mappings.User.findById(id.toString());
		p_channel.addMember(member);
	}
};

module.exports.findById = function*(p_id) {
	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	let dbChannel = yield lib.odin.util.promise.ninvoke(dbCollectionChannel, 'findOne', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});

	if(!dbChannel) {
		throw new lib.odin.Exception('Unknown channel');
	}

	return yield* module.exports.convertFrom(dbChannel);
};

module.exports.search = function*(p_criterias, p_page, p_size) {
	let criterias = {};

	if(p_criterias.owner) { criterias.owner = new lib.deps.mongoDb.ObjectID(p_criterias.owner); }
	if(p_criterias.from) { if(!criterias.date) { criterias.date = {}; } criterias.date.$gte = p_criterias.from; }
	if(p_criterias.to) { if(!criterias.date) { criterias.date = {}; } criterias.date.$lte = p_criterias.to; }
	if(p_criterias.title) { criterias.title = {$regex:p_criterias.title, $options:'i'}; }
	if(p_criterias.tag) { criterias.tags = p_criterias.tag; }
	if(p_criterias.member) { criterias.members = new lib.deps.mongoDb.ObjectID(p_criterias.member); }

	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	let dbChannels = yield lib.odin.util.promise.ninvoke(
		dbCollectionChannel
			.find(criterias)
			.sort({date:1})
			.skip(p_page * p_size)
			.limit(p_size),
		'toArray'
	);

	let channels = [];
	for(let dbChannel of dbChannels) {
		let channel = yield* module.exports.convertFrom(dbChannel);
		channels.push(channel);
	}

	return channels;
};

module.exports.create = function*(p_channel) {
	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	let dbChannel = yield* lib.mappings.Channel.convertTo(p_channel);
	let dbKeys = yield lib.odin.util.promise.ninvoke(dbCollectionChannel, 'insert', dbChannel);

	p_channel.id = dbKeys._id.toString();
};

module.exports.modifiy = function*(p_channel, p_modifications) {
	let fields = new Set();
	for(let key in p_modifications) {
		if(p_modifications[key]) {
			p_channel[key] = p_modifications[key];
			fields.add(key);
		}
	}

	if(!fields.size) {
		return;
	}

	let dbChannel = yield* module.exports.convertTo(p_channel);
	let clause = {$set:{}};

	if(fields.has('title')) { clause.$set.title = dbChannel.title; }
	if(fields.has('summary')) { clause.$set.text = dbChannel.summary; }
	if(fields.has('tags')) { clause.$set.tags = dbChannel.tags; }
	if(fields.has('members')) { clause.$set.members = dbChannel.members; }

	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	yield lib.odin.util.promise.ninvoke(dbCollectionChannel, 'update', {
		_id:dbChannel._id
	}, clause);
};

module.exports.remove = function*(p_id) {
	let dbCollectionChannel = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'channel');
	yield lib.odin.util.promise.ninvoke(dbCollectionChannel, 'remove', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});
};