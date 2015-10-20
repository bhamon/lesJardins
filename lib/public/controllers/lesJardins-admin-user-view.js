'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-user-view', [
	'$scope', '$state', 'user',
	function($scope, $state, p_user) {
		$scope.user = p_user;

		$scope.gotoBack = function(p_user) {
			$state.go('lesJardins.admin.users.list');
		};

		$scope.edit = function() {
			$state.go('lesJardins.admin.users.user.edit', {
				id:p_user.id
			});
		};
	}
]);