'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-building-create', [
	'$scope', '$state', '$element', '$mdToast', 'lesJardins-config',
	function($scope, $state, $element, $mdToast, p_config) {
		$scope.templateInfo = p_config.templatesPath + '/lesJardins-admin-building-info.html';
		$scope.data = {};

		$scope.data = {
			name:''
		};

		$scope.gotoBack = function(p_user) {
			$state.go('lesJardins.admin.buildings');
		};

		$scope.save = function() {
			$mdToast.show(
				$mdToast.simple()
				.content('Bâtiment créé.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);

			$state.go('lesJardins.admin.user.edit', {
// TODO: forward here the new created user id
				id:'123456'
			});
		};
	}
]);