'use strict';

angular
.module('lesJardins')
.directive('lesJardinsUserInfo', [
	'lesJardins-config',
	function(p_config) {
		return {
			scope:{
				user:'='
			},
			templateUrl:p_config.directivesPath + '/user-info/lesJardins-user-info.html'
		};
	}
])