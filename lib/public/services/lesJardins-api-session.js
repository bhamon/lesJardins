'use strict';

angular
.module('lesJardins')
.factory('lesJardins-api-session', [
	'lesJardins-config', 'freyja-api',
	function(p_config, p_api) {
		return p_api.createResource(p_config.apiPath + '/sessions/:token', {}, {
			get:{
				method:'GET',
				requiresAuth:true,
				skipRecover:true,
				params:{
					token:'@token'
				}
			},
			query:{
				method:'GET',
				requiresAuth:true,
				isArray:true,
				params:{
					page:'@page',
					size:'@size'
				}
			},
			create:{
				method:'POST'
			},
			remove:{
				method:'DELETE',
				requiresAuth:true,
				member:true,
				params:{
					token:'@token'
				}
			}
		});
	}
]);