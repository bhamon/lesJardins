'use strict';

/**
	@file		index.js
	@desc		Application bootstrap.
*/

var lib = {
	node:{
		path:require('path')
	},
	odin:{
		core:{
			init:require('odin').init
		}
	},
	registry:require('./registry')
};

/**
	@constant
	@desc		Path to the [init] directory.
				This directory contains all of the init scripts used to bootstrap application.
*/
var PATH_INIT = lib.node.path.join(__dirname, 'init');

lib.odin.core.init.bootstrap(PATH_INIT, function() {
	lib.registry.log.info('Press CTRL+C or send SIGINT to the process to exit (twice to force shutdown)');
})
.fail(function(p_error) {
	if(lib.registry.log) {
		lib.registry.log.error({err:p_error});
	} else {
		console.error('[ERROR] Exception caught by the init chain');
		console.error(p_error.stack);
	}
});