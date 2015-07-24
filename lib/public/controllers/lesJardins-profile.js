'use strict';

angular
.module('lesJardins')
.controller('lesJardins-profile', [
	'$scope', '$element', '$mdToast', 'freyja-sessionHandler',
	function($scope, $element, $mdToast, p_sessionHandler) {
		$scope.user = p_sessionHandler.getSession().data.user;
		$scope.apartments = [
			{id:'1234', building:{name:'B'}, number:12, floor:1, shares:{common:621, stairwell:325, elevator:65}},
			{id:'1234', building:{name:'A'}, number:25, floor:2, shares:{common:475, stairwell:215, elevator:36}}
		];
		$scope.carParks = [
			{id:'1234', number:30, shares:18},
			{id:'1234', number:31, shares:19},
			{id:'1234', number:32, shares:14}
		];

		$scope.data = {};

		$scope.data.identity = {
			firstName:$scope.user.firstName,
			lastName:$scope.user.lastName,
			email:$scope.user.email
		};

		$scope.data.credentials = {
			oldPassword:'',
			newPassword:''
		};

		$scope.data.lots = {
			searchApartment:null,
			searchCarPark:null,
			carParks:[]
		};

		$scope.data.notifications = {
			article:false,
			councilReport:false,
			email:false
		};

		$scope.getLabel = function(p_apartment) {
			return p_apartment.building.name + p_apartment.number;
		};

		$scope.findApartment = function(p_search) {
			return $scope.apartments;
		};

		$scope.findCarParks = function(p_search) {
			return $scope.carParks;
		};

		$scope.save = function() {
			$mdToast.show(
				$mdToast.simple()
				.content('Modifications sauvegardées.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);