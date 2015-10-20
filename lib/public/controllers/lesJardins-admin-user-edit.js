'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-user-edit', [
	'$scope', '$state', '$element', '$mdToast', 'lesJardins-config', 'user',
	function($scope, $state, $element, $mdToast, p_config, p_user) {
		$scope.user = p_user;
		$scope.templateInfo = p_config.templatesPath + '/lesJardins-admin-user-info.html';
		$scope.data = {};

		$scope.data.user = {
			firstName:p_user.firstName,
			lastName:p_user.lastName,
			email:p_user.email
		};

		$scope.gotoBack = function() {
			$state.go('lesJardins.admin.users.user.view', {
				id:p_user.id
			});
		};

		$scope.save = function(p_user) {
			if(!$scope.formUser.$valid) {
				return;
			}

			$mdToast.show(
				$mdToast.simple()
				.content('Modifications sauvegardées !')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);