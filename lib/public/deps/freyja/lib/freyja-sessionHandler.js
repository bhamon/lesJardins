'use strict';

angular
.module('freyja')
.provider('freyja-sessionHandler', function() {
	function Session(p_token, p_remindMe) {
		if(!angular.isString(p_token)) {
			throw new Error('Invalid [token] parameter');
		}

		Object.defineProperty(this, 'token', {enumerable:true, value:p_token});
		Object.defineProperty(this, 'remindMe', {enumerable:true, value:!!p_remindMe});
		Object.defineProperty(this, 'data', {value:{}});
		Object.defineProperty(this, '_rights', {value:{}});
	};

	Session.prototype.hasRight = function(p_right) {
		return !!this._rights[p_right];
	};

	Session.prototype.addRight = function(p_right) {
		this._addRights([p_right]);
	};

	Session.prototype.addRights = function(p_rights) {
		if(!angular.isArray(p_rights)) {
			throw new Error('Invalid [rights] parameter');
		}

		var self = this;
		angular.forEach(p_rights, function(p_right) {
			if(!angular.isString(p_right)) {
				throw new Error('Invalid right: ' + p_right);
			}

			self._rights[p_right] = true;
		});
	};

	Session.prototype.removeRight = function(p_right) {
		delete this._rights[p_right];
	};

	function SessionHandler($q, $injector, $cookies, p_cookieName, p_hooks) {
		Object.defineProperty(this, '$q', {value:$q});
		Object.defineProperty(this, '$injector', {value:$injector});
		Object.defineProperty(this, '$cookies', {value:$cookies});
		Object.defineProperty(this, '_cookieName', {value:p_cookieName});
		Object.defineProperty(this, '_hooks', {value:p_hooks});
		Object.defineProperty(this, '_session', {writable:true, value:null});
	};

	SessionHandler.prototype._invokeHook = function(p_type, p_locals) {
		var hook = this._hooks[p_type];
		if(!hook) {
			throw new Error('Unknown session hook: ' + p_type);
		}

		return this.$injector.invoke(hook, undefined, p_locals);
	};

	SessionHandler.prototype.init = function() {
		if(this._session) {
			return this.$q.resolve();
		}

		var token = this.$cookies.get(this._cookieName);
		if(!token) {
			return this.$q.reject();
		}

		this._session = new Session(token, true);

		return this.$q.when(this._invokeHook('populate', {session:this._session}));
	};

	SessionHandler.prototype.isAuthenticated = function() {
		return !!this._session;
	};

	SessionHandler.prototype.getSession = function() {
		if(!this._session) {
			throw new Error('Session not initialized');
		}

		return this._session;
	};

	SessionHandler.prototype.logIn = function(p_token, p_remindMe) {
		if(this._session) {
			throw new Error('Session already initialized');
		} else if(!p_token || !angular.isString(p_token)) {
			throw new Error('Invalid [token] parameter');
		}

		this._session = new Session(p_token, p_remindMe);
		if(this._session.remindMe) {
			this.$cookies.put(this._cookieName, this._session.token);
		}

		return this.$q.when(this._invokeHook('populate', {session:this._session}));
	};

	SessionHandler.prototype.recover = function() {
		var self = this;
		return this.$q.when(this._invokeHook('recover'))
		.then(function(p_session) {
			if(p_session == null) {
				return $q.reject();
			} else if(!angular.isObject(p_session)) {
				throw new Error('Invalid [session] parameter');
			}

			return self.logIn(p_session.token, p_session.remindMe);
		});
	};

	SessionHandler.prototype.logOut = function() {
		if(!this._session) {
			throw new Error('Session not initialized');
		}

		var self = this;
		return this.$q.when(this._invokeHook('remove'))
		.finally(function() {
			self._session = null;
			self.$cookies.remove(self._cookieName);
		});
	};

	var cookieName = 'sessionToken';
	var hooks = {
		populate:function() {},
		recover:function() { return null; },
		remove:function() {}
	};

	this.setCookieName = function(p_cookieName) {
		if(typeof p_cookieName != 'string') {
			throw new Error('Invalid [cookieName] parameter');
		}

		cookieName = p_cookieName;
	};

	this.attachSessionHook = function(p_type, p_hook) {
		if(!(p_type in hooks)) {
			throw new Error('Unknown session hook type: ' + p_type);
		} else if(!angular.isFunction(p_hook) && !angular.isArray(p_hook)) {
			throw new Error('Invalid [hook] parameter');
		}

		hooks[p_type] = p_hook;
	};

	this.$get = [
		'$q', '$injector', '$cookies',
		function($q, $injector, $cookies) {
			return new SessionHandler($q, $injector, $cookies, cookieName, hooks);
		}
	];
});