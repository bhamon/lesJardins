'use strict';

angular
.module('lesJardins')
.directive('lesJardinsValidatorConfirmation', function() {
	return {
		restrict:'A',
		require:'ngModel',
		scope:{
			field:'=lesJardinsValidatorConfirmation'
		},
		link:function(p_scope, p_element, p_attributes, p_controller) {
			p_controller.$validators.confirmation = function(p_modelValue, p_viewValue) {
console.log(p_scope);
				var value = p_modelValue || p_viewValue;
				return p_scope.field === value;
			};

			p_scope.$watch('field', function() {
				p_controller.$validate();
			});
		}
	};
})