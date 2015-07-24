'use strict';

/*
	lot [
		{
			id:'',
			type:'common',
			serviceCharges:{}
		},
		{
			id:'',
			type:'building',
			serviceCharges:{},
			doorCode:'',
			elevator:true
		},
		{
			id:'',
			type:'apartment',
			building:@building,
			number:12,
			floor:1,
			shares:{
				common:0,
				stairwell:0,
				elevator:0
			}
		},
		{
			id:'',
			type:'carPark',
			number:21,
			shares:0
		}
	]
*/

angular
.module('lesJardins')
.factory('lesJardins-api-lot', [
	'lesJardins-config', 'freyja-api',
	function(p_config, p_api) {
		return p_api.createResource(p_config.apiPath + '/lot/:id', {}, {
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