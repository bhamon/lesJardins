'use strict';

angular
.module('lesJardins')
.directive('lesJardinsValidatorPassword', function() {
	return {
		restrict:'A',
		require:'ngModel',
		link:function(p_scope, p_element, p_attributes, p_controller) {
			p_controller.$validators.password = function(p_modelValue, p_viewValue) {
				var value = p_modelValue || p_viewValue;
				return /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value);
			};
		}
	};
})