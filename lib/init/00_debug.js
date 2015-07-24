'use strict';

/**
	@module		init/00_debug
	@desc		Debug init script.
*/

var lib = {
	deps:{
		q:require('q')
	}
};

/**
	@desc	Enables some debug features if the DEV environment variable is set.
*/
module.exports.init = function() {
	if(process.env.DEV) {
		lib.deps.q.longStackSupport = true;
	}
};