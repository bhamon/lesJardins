'use strict';

/**
	@module		init/21_mongoDb
	@desc		MongoDB init script.
*/

let lib = {
	deps:{
		mongoDb:require('mongodb')
	},
	odin:{
		util:require('odin').util
	},
	registry:require('../registry')
};

/**
	@desc	Initializes the database.
*/
module.exports.init = function() {
	let config = require('../../config/mongoDb');

	lib.registry.log.info('Connecting to MongoDB database...');
	return lib.odin.util.promise.ninvoke(lib.deps.mongoDb.MongoClient, 'connect', config.url)
	.then(function(p_db) {
		lib.registry.db = p_db;

		lib.registry.log.info('Authenticating against database...');
		return lib.odin.util.promise.ninvoke(p_db, 'authenticate', config.user, config.password);
	});
};

/**
	@desc	Stops the database.
*/
module.exports.cleanup = function() {
	if(!lib.registry.db) {
		return;
	}

	lib.registry.log.info('Closing MongoDB database...');
	return lib.odin.util.promise.ninvoke(lib.registry.db, 'close');
};