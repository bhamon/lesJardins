'use strict';

angular
.module('lesJardins')
.controller('lesJardins-admin-setting-mailServer-edit', [
	'$scope', '$mdDialog', 'lesJardins-config', 'mailServer',
	function($scope, $mdDialog, p_config, p_mailServer) {
		$scope.data = {
			type:p_mailServer.type,
			host:p_mailServer.host,
			port:p_mailServer.port,
			user:p_mailServer.user,
			password:p_mailServer.password
		};

		$scope.save = function() {
			if(!$scope.formMailServer.$valid) {
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