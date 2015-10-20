'use strict';

angular
.module('lesJardins')
.factory('lesJardins-api-channel', [
	'lesJardins-config', 'freyja-api',
	function(p_config, p_api) {
		return p_api.createResource(p_config.apiPath + '/channels/:channel', {}, {
			get:{
				method:'GET',
				requiresAuth:true,
				params:{
					channel:'@channel'
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
				method:'POST',
				requiresAuth:true
			},
			remove:{
				method:'DELETE',
				requiresAuth:true,
				member:true,
				params:{
					channel:'@channel'
				}
			}
		});
	}
]);