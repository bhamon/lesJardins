'use strict';

/**
	@module		init/30_server
	@desc		Server init script.
*/

let lib = {
	node:{
		path:require('path'),
		fs:require('fs'),
		url:require('url')
	},
	deps:{
		co:require('co'),
		coFs:require('co-fs'),
		bodyParser:require('body-parser'),
		cors:require('cors')
	},
	odin:{
		util:require('odin').util,
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
let ROUTERS_PATH = lib.node.path.resolve(__dirname, '../routers');

/**
	@constant
	@type		{String}
	@desc		Path to the [public] directory.
*/
let PUBLIC_PATH = lib.node.path.resolve(__dirname, '../public');

/**
	@constant
	@type		{String}
	@desc		Path to the [node_modules] directory.
*/
let DEPS_PATH = lib.node.path.resolve(__dirname, '../../node_modules');

/**
	@desc	Initializes the server component.
*/
module.exports.init = function() {
	let config = require('../../config/webServer');

	lib.registry.log.info('Creating web server...');

	let webServer = new lib.odin.http.Server();
	webServer.router.use(lib.deps.bodyParser.json());
	webServer.router.use(lib.deps.cors());
	webServer.router.use(lib.odin.http.middlewares.authParser);
	webServer.router.use(lib.odin.http.middlewares.validators);
	webServer.router.use(lib.odin.http.middlewares.session);

	let api = webServer.router.route(config.api);
	let pub = webServer.router.route(config.public);

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

	return lib.deps.co(function*() {
		yield api.attachRouters(ROUTERS_PATH);

		let files = yield lib.deps.coFs.readdir(PUBLIC_PATH);
		for(let file of files) {
			let stats = yield lib.deps.coFs.stat(lib.node.path.join(PUBLIC_PATH, file));
			if(!stats.isDirectory()) {
				continue;
			}

			let route = pub.route(lib.node.url.resolve('/', file));
			route.attachStatic(lib.node.path.join(PUBLIC_PATH, file));
			route.use(function(p_request, p_response, p_next) {
				throw new lib.odin.http.ExceptionHttp(404, 'Not found');
			});
		}

		let route = pub.route('/deps');
		route.attachStatic(DEPS_PATH);
		route.use(function(p_request, p_response, p_next) {
			throw new lib.odin.http.ExceptionHttp(404, 'Not found');
		});

		api.use(function(p_request, p_response, p_next) {
			throw new lib.odin.http.ExceptionRest(404, 'api.notFound', 'API endpoint not found');
		});

		pub.use(function(p_request, p_response, p_next) {
			return p_response.sendFile(lib.node.path.join(PUBLIC_PATH, 'index.html'));
		});

		lib.registry.log.info('Starting web server...');
		yield webServer.listen(config.port, config.host);

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