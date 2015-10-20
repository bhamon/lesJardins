'use strict';

angular
.module('lesJardins')
.factory('lesJardins-api-param', [
	'lesJardins-config', 'freyja-api',
	function(p_config, p_api) {
		return p_api.createResource(p_config.apiPath + '/params/:param', {}, {
			get:{
				method:'GET',
				requiresAuth:true,
				params:{
					param:'@param'
				}
			},
			create:{
				method:'POST',
				requiresAuth:true
			},
			modify:{
				method:'POST',
				requiresAuth:true,
				member:true,
				params:{
					param:'@param'
				}
			},
			remove:{
				method:'DELETE',
				requiresAuth:true,
				member:true,
				params:{
					param:'@param'
				}
			}
		});
	}
]);