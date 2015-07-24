'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-building-edit', [
	'$scope', '$state', '$element', '$mdToast', 'lesJardins-config', 'building',
	function($scope, $state, $element, $mdToast, p_config, p_building) {
		$scope.building = p_building;
		$scope.templateInfo = p_config.templatesPath + '/lesJardins-admin-building-info.html';
		$scope.data = {};

		$scope.data = {
		};

		$scope.gotoBack = function() {
			$state.go('lesJardins.admin.building.view', {
				id:p_building.id
			});
		};

		$scope.save = function() {
			if(!$scope.formBuilding.$valid) {
				return;
			}

			$mdToast.show(
				$mdToast.simple()
				.content('Modifications sauvegardées.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);