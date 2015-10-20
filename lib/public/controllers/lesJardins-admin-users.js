'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-users', [
	'$scope', '$state', '$stateParams', '$element', '$mdDialog', '$mdToast', 'lesJardins-api-user', 'users',
	function($scope, $state, $stateParams, $element, $mdDialog, $mdToast, p_apiUser, p_users) {
		$scope.users = p_users;
		$scope.page = $stateParams.page;
		$scope.size = $stateParams.size;

		$scope.previous = function() {
			$state.go('lesJardins.admin.users.list', {
				page:$stateParams.page - 1,
				size:$stateParams.size
			});
		};

		$scope.next = function() {
			$state.go('lesJardins.admin.users.list', {
				page:$stateParams.page + 1,
				size:$stateParams.size
			});
		};

		$scope.create = function() {
			$state.go('lesJardins.admin.users.create');
		};

		$scope.view = function(p_user) {
			$state.go('lesJardins.admin.users.user.view', {
				user:p_user.id
			});
		};

		$scope.remove = function(p_user, p_event) {
			var confirm = $mdDialog
				.confirm()
				.title('Suppression')
				.content('Etes-vous sûr de vouloir définitivement supprimer l\'utilisateur <b>' + p_user.firstName + ' ' + p_user.lastName + '</b> ?')
				.ariaLabel('Suppression de l\'utilisateur')
				.targetEvent(p_event)
				.ok('Oui')
				.cancel('Non');

			$mdDialog.show(confirm)
			.then(function() {
				p_apiUser.remove({
					user:p_user.id
				}).$promise
				.then(function() {
					$mdToast.show(
						$mdToast.simple()
						.content('Utilisateur supprimé')
						.position('bottom right')
						.parent($element)
						.hideDelay(3000)
					);

					$state.go('lesJardins.admin.users.list', {
						page:$stateParams.page,
						size:$stateParams.size
					});
				}, function(p_error) {
					$mdToast.show(
						$mdToast.simple()
						.content('Suppression impossible')
						.position('bottom right')
						.parent($element)
						.hideDelay(3000)
					);
				});
			});
		};
	}
]);