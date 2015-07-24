'use strict';

/**
	@module		init/30_server
	@desc		Server init script.
*/

var lib = {
	node:{
		path:require('path'),
		url:require('url')
	},
	deps:{
		q:require('q'),
		qIo:{
			fs:require('q-io/fs')
		},
		bodyParser:require('body-parser'),
		cors:require('cors')
	},
	odin:{
		http:{
			ExceptionHttp:require('odin-http').ExceptionHttp,
			ExceptionRest:require('odin-http').ExceptionRest,
			Server:require('odin-http').Server,
			Router:require('odin-http').Router,
			middlewares:{
				authParser:require('odin-http').middlewares.authParser,
				validators:require('odin-http').middlewares.validators,
				session:require('odin-http').middlewares.session
			}
		}
	},
	registry:require('../registry')
};

/**
	@namespace		routers
	@desc			Server routers.
*/
/**
	@constant
	@type		{String}
	@desc		Path to the [routers] directory.
*/
var ROUTERS_PATH = lib.node.path.resolve(__dirname, '../routers');

/**
	@constant
	@type		{String}
	@desc		If the DEV environment variable is set, should point to the [public] directory.
				Else, should point to the Gulp-generated [public_dist] directory.
*/
var PUBLIC_PATH = (process.env.DEV) ? lib.node.path.resolve(__dirname, '../public') : lib.node.path.resolve(__dirname, '../public_dist');

/**
	@desc	Initializes the server component.
*/
module.exports.init = function() {
	var config = require('../../config/webServer');

	lib.registry.log.info('Creating web server...');

	var webServer = new lib.odin.http.Server();
	webServer.router.use(lib.deps.bodyParser.json());
	webServer.router.use(lib.deps.cors());
	webServer.router.use(lib.odin.http.middlewares.authParser);
	webServer.router.use(lib.odin.http.middlewares.validators);
	webServer.router.use(lib.odin.http.middlewares.session);

	var api = webServer.router.route(config.api);
	var pub = webServer.router.route(config.public);

	api.options('*', lib.deps.cors());

	webServer.router.use(function(p_error, p_request, p_response, p_next) {
		if(p_error instanceof lib.odin.http.ExceptionRest) {
			p_response.status(p_error.statusCode);
			return p_response.send({
				type:p_error.type,
				message:p_error.message,
				details:p_error.details
			});
		} else if(p_error instanceof lib.odin.http.ExceptionHttp) {
			p_response.status(p_error.statusCode);
			return p_response.send({
				type:'raw',
				message:p_error.message
			});
		} else {
			lib.registry.log.error(p_error);

			p_response.status(500);
			return p_response.send({
				type:'internal',
				message:p_error.message
			});
		}
	});

	return lib.deps.q.all([
		api.attachRouters(ROUTERS_PATH),
		lib.deps.qIo.fs.list(PUBLIC_PATH)
		.then(function(p_files) {
			return lib.deps.q.all(p_files.map(function(p_file) {
				return lib.deps.qIo.fs.stat(lib.node.path.join(PUBLIC_PATH, p_file))
				.then(function(p_stats) {
					return {
						file:p_file,
						stats:p_stats
					};
				});
			}));
		})
		.then(function(p_entries) {
			p_entries
			.filter(function(p_entry) { return p_entry.stats.isDirectory(); })
			.forEach(function(p_entry) {
				var route = pub.route(lib.node.url.resolve('/', p_entry.file));
				route.attachStatic(lib.node.path.join(PUBLIC_PATH, p_entry.file));
				route.use(function(p_request, p_response, p_next) {
					throw new lib.odin.http.ExceptionHttp(404, 'Not found');
				});
			});
		})
	])
	.then(function() {
		api.use(function(p_request, p_response, p_next) {
			throw new lib.odin.http.ExceptionRest(404, 'api.notFound', 'API endpoint not found');
		});

		pub.use(function(p_request, p_response, p_next) {
			return p_response.sendFile(lib.node.path.join(PUBLIC_PATH, 'index.html'));
		});

		lib.registry.log.info('Starting web server...');
		return webServer.listen(config.port, config.host);
	})
	.then(function() {
		lib.registry.log.info('Web server bound to %s:%d', config.host, config.port);
		lib.registry.webServer = webServer;
	});
};

/**
	@desc	Shuts down the server.
*/
module.exports.cleanup = function() {
	if(!lib.registry.webServer) {
		return;
	}

	lib.registry.log.info('Shutting down web server...');
	return lib.registry.webServer.shutdown();
};