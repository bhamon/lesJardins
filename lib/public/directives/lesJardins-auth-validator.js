'use strict';

angular
.module('lesJardins')
.directive('lesJardinsAuthValidator', function() {
	return {
		require:'ngModel',
		link:function(p_scope, p_element, p_attributes, p_controller) {
			p_controller.$validators.auth = function(p_modelValue, p_viewValue) {
				return true;
			};
		}
	};
})