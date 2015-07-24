'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-buildings', [
	'$scope', '$state', '$element', '$mdToast',
	function($scope, $state, $element, $mdToast) {
		$scope.buildings = [
			{id:'1a2b3c', name:'A', apartmentsCount:15},
			{id:'4d5e6f', name:'B', apartmentsCount:20}
		];

		$scope.create = function() {
			$state.go('lesJardins.admin.buildings.create');
		};

		$scope.view = function(p_building) {
			$state.go('lesJardins.admin.building.view', {
				id:p_building.id
			});
		};

		$scope.remove = function(p_building) {
			$mdToast.show(
				$mdToast.simple()
				.content('Bâtiment supprimé.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);