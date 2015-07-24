'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-users', [
	'$scope', '$state', '$element', '$mdToast',
	function($scope, $state, $element, $mdToast) {
		$scope.users = [
			{id:'1a2b3c', firstName:'John', lastName:'Doe', email:'john.doe@edf.fr'},
			{id:'4d5e6f', firstName:'Jane', lastName:'Doe', email:'jane.doe@edf.fr'}
		];

		$scope.create = function() {
			$state.go('lesJardins.admin.users.create');
		};

		$scope.view = function(p_user) {
// TODO: update this when the back is done
			$state.go('lesJardins.admin.user.view', {
				id:'1234'
			});
		};

		$scope.remove = function(p_user) {
			$mdToast.show(
				$mdToast.simple()
				.content('Utilisateur supprimé !')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);