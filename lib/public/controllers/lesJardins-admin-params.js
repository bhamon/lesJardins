'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-params', [
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

		var toastParamSaved = function() {
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
				templateUrl:p_config.templatesPath + '/lesJardins-admin-param-dataSource-edit.html',
				controller:'lesJardins-admin-param-dataSource-edit',
				locals:{
					dataSource:$scope.dataSource
				}
			})
			.then(function(p_dataSource) {
				$scope.dataSource = p_dataSource;
				toastParamSaved();
			});
		};

		$scope.editMailServer = function() {
			return $mdDialog.show({
				templateUrl:p_config.templatesPath + '/lesJardins-admin-param-mailServer-edit.html',
				controller:'lesJardins-admin-param-mailServer-edit',
				locals:{
					mailServer:$scope.mailServer
				}
			})
			.then(function(p_mailServer) {
				$scope.mailServer = p_mailServer;
				toastParamSaved();
			});
		};
	}
]);