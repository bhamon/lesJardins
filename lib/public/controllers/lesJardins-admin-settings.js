'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-settings', [
	'$scope', '$state', '$element', '$mdDialog', '$mdToast', 'lesJardins-config',
	function($scope, $state, $element, $mdDialog, $mdToast, p_config) {
		$scope.dataSource = {
			type:'mongodb',
			user:'user',
			password:'password',
			host:'localhost',
			port:1234,
			resource:'lesJardins'
		};

		$scope.mailServer = {
			type:'smtp',
			user:'user',
			password:'password',
			host:'localhost',
			port:1234
		};

		var toastSettingSaved = function() {
			$mdToast.show(
				$mdToast.simple()
				.content('Paramètre modifié.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};

		$scope.editDataSource = function() {
			return $mdDialog.show({
				templateUrl:p_config.templatesPath + '/lesJardins-admin-setting-dataSource-edit.html',
				controller:'lesJardins-admin-setting-dataSource-edit',
				locals:{
					dataSource:$scope.dataSource
				}
			})
			.then(function(p_dataSource) {
				$scope.dataSource = p_dataSource;
				toastSettingSaved();
			});
		};

		$scope.editMailServer = function() {
			return $mdDialog.show({
				templateUrl:p_config.templatesPath + '/lesJardins-admin-setting-mailServer-edit.html',
				controller:'lesJardins-admin-setting-mailServer-edit',
				locals:{
					mailServer:$scope.mailServer
				}
			})
			.then(function(p_mailServer) {
				$scope.mailServer = p_mailServer;
				toastSettingSaved();
			});
		};
	}
]);