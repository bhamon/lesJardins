'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-building-view', [
	'$scope', '$state', 'building',
	function($scope, $state, p_building) {
		$scope.building = p_building;

		$scope.gotoBack = function(p_building) {
			$state.go('lesJardins.admin.buildings');
		};

		$scope.edit = function() {
			$state.go('lesJardins.admin.building.edit', {
				id:p_building.id
			});
		};
	}
]);