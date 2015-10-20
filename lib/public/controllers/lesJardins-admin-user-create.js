'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-user-create', [
	'$scope', '$state', '$element', '$mdToast', 'lesJardins-config', 'lesJardins-api-user',
	function($scope, $state, $element, $mdToast, p_config, p_apiUser) {
		$scope.data = {};

		$scope.data = {
			email:'',
			password:'',
			confirmation:'',
			firstName:'',
			lastName:''
		};

		$scope.gotoBack = function(p_user) {
			$state.go('lesJardins.admin.users.list');
		};

		$scope.save = function() {
			if($scope.formUser.$invalid) {
				return;
			}

			return p_apiUser.create({
				email:$scope.data.email,
				password:$scope.data.password,
				firstName:$scope.data.firstName,
				lastName:$scope.data.lastName
			}).$promise
			.then(function(p_keys) {
				$mdToast.show(
					$mdToast.simple()
					.content('Utilisateur créé.')
					.position('bottom right')
					.parent($element)
					.hideDelay(3000)
				);

				$state.go('lesJardins.admin.users.user.view', {
					user:p_keys.id
				});
			}, function() {
				$mdToast.show(
					$mdToast.simple()
					.content('Impossible de créer l\'utilisateur.')
					.position('bottom right')
					.parent($element)
					.hideDelay(3000)
				);
			});
		};
	}
]);