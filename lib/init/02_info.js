'use strict';

/**
	@module		init/02_info
	@desc		Info init script.
*/

let lib = {
	node:{
		path:require('path')
	},
	registry:require('../registry')
};

/**
	@constant
	@type		{String}
	@desc		Path to the [package.json] file.
*/
let PACKAGE_PATH = lib.node.path.resolve(__dirname, '../../package.json');

/**
	@desc	Register some server information.
*/
module.exports.init = function() {
	let pkg = require(PACKAGE_PATH);

	lib.registry.info = {};
	lib.registry.info.name = pkg.name;
	lib.registry.info.version = pkg.version;
	lib.registry.info.mode = (process.env.DEV) ? 'development' : 'production';

	lib.registry.log.info(
		'%s v%s (%s)',
		lib.registry.info.name,
		lib.registry.info.version,
		lib.registry.info.mode
	);
};