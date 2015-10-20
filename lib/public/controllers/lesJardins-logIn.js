'use strict';

angular
.module('lesJardins')
.controller('lesJardins-logIn', [
	'$scope', '$mdDialog', 'lesJardins-api-session',
	function($scope, $mdDialog, p_apiSession) {
		$scope.data = {
// DEBUG: remove those predefined values
			email:'admin@lesJardins.com',
			password:'Admin1234',
			remindMe:true
		};

		$scope.logIn = function() {
			if($scope.formLogIn.$invalid) {
				return;
			}

			return p_apiSession.create({
				email:$scope.data.email,
				password:$scope.data.password,
				remindMe:$scope.data.remindMe
			}).$promise
			.then(function(p_data) {
				$mdDialog.hide({
					token:p_data.token,
					creationDate:new Date(p_data.creationDate),
					rights:p_data.rights,
					data:p_data.data,
					remindMe:$scope.data.remindMe
				});
			}, function(p_data) {
				$scope.formLogIn.email.$error.auth = true;
			});
		};
	}
]);