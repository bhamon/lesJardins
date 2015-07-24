'use strict';

angular
.module('lesJardins')
.controller('lesJardins-sidenav', [
	'$scope', '$state', 'freyja-sessionHandler',
	function($scope, $state, p_sessionHandler) {
		$scope.user = p_sessionHandler.getSession().data.user;

		$scope.gotoDashboard = function() { $state.go('lesJardins.dashboard'); }
		$scope.gotoArticles = function() { $state.go('lesJardins.articles'); }
		$scope.gotoProfile = function() { $state.go('lesJardins.profile'); }
		$scope.gotoContact = function() { $state.go('lesJardins.contact'); }
		$scope.gotoAdminSettings = function() { $state.go('lesJardins.admin.settings'); }
		$scope.gotoAdminUsers = function() { $state.go('lesJardins.admin.users'); }
		$scope.gotoAdminBuildings = function() { $state.go('lesJardins.admin.buildings'); }
	}
]);