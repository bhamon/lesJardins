'use strict';

angular
.module('lesJardins')
.factory('lesJardins-api-user', [
	'lesJardins-config', 'freyja-api',
	function(p_config, p_api) {
		return p_api.createResource(p_config.apiPath + '/users/:id', {}, {
			get:{
				method:'GET',
				requiresAuth:true
			},
			query:{
				method:'GET',
				requiresAuth:true,
				isArray:true,
				params:{
					page:'@page',
					size:'@size'
				}
			}
		});
	}
]);