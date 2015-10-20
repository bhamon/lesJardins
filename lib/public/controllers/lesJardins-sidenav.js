'use strict';

angular
.module('lesJardins')
.controller('lesJardins-sidenav', [
	'$scope', '$state', 'freyja-sessionHandler',
	function($scope, $state, p_sessionHandler) {
		$scope.user = p_sessionHandler.getSession().data.user;
		$scope.council = {};
		$scope.admin = {};

		$scope.showCouncil = function() {
			return !!Object.keys($scope.council).length;
		};

		$scope.showAdmin = function() {
			return !!Object.keys($scope.admin).length;
		};

		var session = p_sessionHandler.getSession();
		if(session.hasRight('params.*')) { $scope.admin.params = true;; }
		if(session.hasRight('users.*')) { $scope.admin.users = true; }

		$scope.gotoArticles = function() { $state.go('lesJardins.articles.list'); }
		$scope.gotoProfile = function() { $state.go('lesJardins.profile'); }
		$scope.gotoChannels = function() { $state.go('lesJardins.channels.list'); }
		$scope.gotoContact = function() { $state.go('lesJardins.contact'); }
		$scope.gotoServiceCharges = function() { $state.go('lesJardins.serviceCharges'); }
		$scope.gotoAdminParams = function() { $state.go('lesJardins.admin.params'); }
		$scope.gotoAdminUsers = function() { $state.go('lesJardins.admin.users.list'); }
		$scope.gotoAdminBuildings = function() { $state.go('lesJardins.admin.buildings'); }
	}
]);