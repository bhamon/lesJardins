'use strict';

angular
.module('lesJardins')
.controller('lesJardins-logIn', [
	'$scope', '$mdDialog', 'lesJardins-api-session',
	function($scope, $mdDialog, p_apiSession) {
		$scope.data = {
			email:'',
			password:'',
			remindMe:false
		};

		$scope.logIn = function() {
			if($scope.formLogIn.$invalid) {
				return;
			}

// TODO: uncomment when server done
/*
			return p_apiSession.create({
				login:$scope.data.login,
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
				$scope.formLogin.login.$error.auth = true;
			});
*/
			$mdDialog.hide({
				token:'123456',
				creationDate:new Date(),
				rights:[],
				data:{},
				remindMe:$scope.data.remindMe
			});
		};
	}
]);