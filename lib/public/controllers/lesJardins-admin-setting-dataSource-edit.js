'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-setting-dataSource-edit', [
	'$scope', '$mdDialog', 'lesJardins-config', 'dataSource',
	function($scope, $mdDialog, p_config, p_dataSource) {
		$scope.data = {
			type:p_dataSource.type,
			host:p_dataSource.host,
			port:p_dataSource.port,
			user:p_dataSource.user,
			password:p_dataSource.password,
			resource:p_dataSource.resource
		};

		$scope.save = function() {
			if(!$scope.formDataSource.$valid) {
				return;
			}

// TODO: save setting

			$mdDialog.hide($scope.data);
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
		};
	}
]);