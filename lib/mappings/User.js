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
		User:require('../models/User')
	}
};

module.exports.convertFrom = function*(p_document) {
	return new lib.models.User({
		id:p_document._id.toString(),
		email:p_document.email,
		password:p_document.password,
		firstName:p_document.firstName,
		lastName:p_document.lastName,
		rights:p_document.rights
	});
};

module.exports.convertTo = function*(p_instance) {
	let dbUser = {
		email:p_instance.email,
		password:p_instance.password,
		firstName:p_instance.firstName,
		lastName:p_instance.lastName,
		rights:Array.from(p_instance.rights)
	};

	if(p_instance.id) {
		dbUser._id = new lib.deps.mongoDb.ObjectID(p_instance.id);
	}

	return dbUser;
};

module.exports.findById = function*(p_id) {
	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	let dbUser = yield lib.odin.util.promise.ninvoke(dbCollectionUser, 'findOne', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});

	if(!dbUser) {
		throw new lib.odin.Exception('Unknown user');
	}

	return yield* module.exports.convertFrom(dbUser);
};

module.exports.findByEmailPassword = function*(p_email, p_password) {
	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	let dbUser = yield lib.odin.util.promise.ninvoke(dbCollectionUser, 'findOne', {
		email:p_email,
		password:p_password
	});

	if(!dbUser) {
		throw new lib.odin.Exception('Unknown user');
	}

	return yield* module.exports.convertFrom(dbUser);
};

module.exports.search = function*(p_criterias, p_page, p_size) {
	let criterias = {};

	if(p_criterias.firstName) { criterias.firstName = {$regex:p_criterias.firstName, $options:'i'}; }
	if(p_criterias.lastName) { criterias.lastName = {$regex:p_criterias.lastName, $options:'i'}; }

	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	let dbUsers = yield lib.odin.util.promise.ninvoke(
		dbCollectionUser
			.find(criterias)
			.sort({lastName:1, firstName:1})
			.skip(p_page * p_size)
			.limit(p_size),
		'toArray'
	);

	let users = [];
	for(let dbUser of dbUsers) {
		let user = yield* module.exports.convertFrom(dbUser);
		users.push(user);
	}

	return users;
};

module.exports.create = function*(p_user) {
	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	let dbUser = yield* module.exports.convertTo(p_user);
	let dbResult = yield lib.odin.util.promise.ninvoke(dbCollectionUser, 'insert', dbUser);

	p_user.id = dbResult.insertedIds[0].toString();
};

module.exports.modify = function*(p_user, p_modifications) {
	let fields = new Set();
	for(let key in p_modifications) {
		if(p_modifications[key]) {
			p_user[key] = p_modifications[key];
			fields.add(key);
		}
	}

	if(!fields.size) {
		return;
	}

	let dbUser = yield* module.exports.convertTo(p_user);
	let clause = {$set:{}};

	if(fields.has('email')) { clause.$set.email = dbUser.email; }
	if(fields.has('password')) { clause.$set.password = dbUser.password; }
	if(fields.has('firstName')) { clause.$set.firstName = dbUser.firstName; }
	if(fields.has('lastName')) { clause.$set.lastName = dbUser.lastName; }
	if(fields.has('rights')) { clause.$set.rights = dbUser.rights; }

	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	yield lib.odin.util.promise.ninvoke(dbCollectionUser, 'update', {
		_id:dbUser._id
	}, clause);
};

module.exports.remove = function*(p_id) {
	let dbCollectionUser = yield lib.odin.util.promise.ninvoke(lib.registry.db, 'collection', 'user');
	yield lib.odin.util.promise.ninvoke(lib.registry.db, 'remove', {
		_id:new lib.deps.mongoDb.ObjectID(p_id)
	});
};