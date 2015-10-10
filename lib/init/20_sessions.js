'use strict';

/**
	@module		init/20_sessions
	@desc		Sessions init script.
*/

let lib = {
	odin:{
		http:{
			SessionStore:require('odin-http').SessionStore,
			SessionWatcher:require('odin-http').SessionWatcher
		}
	},
	registry:require('../registry')
};

/**
	@desc	Initializes the sessions store and starts the sessions watcher.
*/
module.exports.init = function() {
	let config = require('../../config/sessions');

	lib.registry.log.info('Creating sessions store...');
	lib.registry.sessionStore = new lib.odin.http.SessionStore(config.store);

	lib.registry.log.info('Starting sessions watcher...');
	lib.registry.sessionWatcher = new lib.odin.http.SessionWatcher(lib.registry.sessionStore, config.watcher);
};

/**
	@desc	Stops the sessions watcher.
*/
module.exports.cleanup = function() {
	if(!lib.registry.sessionWatcher) {
		return;
	}

	lib.registry.log.info('Stopping sessions watcher...');
	lib.registry.sessionWatcher.stop();
};