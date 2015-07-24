'use strict';

/**
	@module		init/01_log
	@desc		Log init script.
*/

var lib = {
	odin:{
		core:{
			Log:require('odin').Log
		}
	},
	registry:require('../registry')
};

/**
	@desc	Initializes the log component.
*/
module.exports.init = function() {
	var config = require('../../config/log');
	lib.registry.log = new lib.odin.core.Log(config);
};