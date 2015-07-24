'use strict';

angular
.module('lesJardins')
.controller('lesJardins-header', [
	'$scope', '$state', '$mdSidenav', 'freyja-sessionHandler',
	function($scope, $state, $mdSidenav, p_sessionHandler) {
		$scope.notifications = [
			{
				id:'123',
				date:new Date(),
				viewed:false,
				type:'council.subscription',
				message:'Test'
			}
		];

		$scope.toggleSidenav = function() {
			$mdSidenav('sidenav').toggle();
		};

		$scope.logOut = function() {
			p_sessionHandler.logOut()
			.finally(function() {
				$state.go('logIn');
			});
		};

		$scope.gotoNotifications = function() {
			$state.go('lesJardins.notifications');
		};

		$scope.gotoHelp = function() {
			$state.go('lesJardins.help');
		};
	}
]);