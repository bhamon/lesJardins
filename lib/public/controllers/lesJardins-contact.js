'use strict';

angular
.module('lesJardins')
.controller('lesJardins-contact', [
	'$scope', '$element', '$mdToast',
	function($scope, $element, $mdToast) {
		$scope.data = {};
		$scope.data.object = '';
		$scope.data.message = '';

		$scope.send = function() {
			if(!$scope.formContact.$valid) {
				return;
			}

			$mdToast.show(
				$mdToast.simple()
				.content('Message envoyé.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);