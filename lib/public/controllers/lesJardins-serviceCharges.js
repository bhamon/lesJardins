'use strict';

angular
.module('lesJardins')
.controller('lesJardins-serviceCharges', [
	'$scope',
	function($scope) {
		$scope.apartment = {
			elevator:true,
			shares:{
				common:264,
				stairwell:627,
				elevator:69,
				water:27
			}
		};

		$scope.carParks = [
			{
				shares:{
					common:18,
					stairwell:0,
					elevator:0,
					water:0
				}
			}
		];

		$scope.serviceCharges = [
			{
				name:'common',
				label:'Charges générales',
				shares:10000,
				entries:[
					{label:'Entretient', amount:{estimated:1000, real:1000}},
					{label:'Contrat espaces verts', amount:{estimated:4000, real:4000}},
					{label:'EDF', amount:{estimated:500, real:500}},
					{label:'Assurance', amount:{estimated:3000, real:3000}},
					{label:'Porte parking', amount:{estimated:500, real:500}},
					{label:'Honoraires syndic', amount:{estimated:6300, real:6300}},
					{label:'Frais affranchissement', amount:{estimated:300, real:300}},
					{label:'Entretient compteurs d\'eau', amount:{estimated:1000, real:1000}}
				]
			},
			{
				name:'stairwell',
				label:'Cage d\'escalier',
				shares:10000,
				entries:[
					{label:'Contrat ménage et poubelles', amount:{estimated:5000, real:5000}},
					{label:'Contrat VMC', amount:{estimated:300, real:300}}
				]
			},
			{
				name:'elevator',
				label:'Ascenseur',
				shares:1000,
				entries:[
					{label:'Contrat ascenseur', amount:{estimated:1950, real:1950}},
					{label:'Téléalarme', amount:{estimated:300, real:300}},
					{label:'EDF', amount:{estimated:1000, real:1000}}
				]
			},
			{
				name:'water',
				label:'Eau froide',
				shares:1000,
				entries:[
					{label:'Consommation eau', amount:{estimated:5000, real:5000}}
				]
			}
		];

		$scope.data = {
			reference:'estimated',
			divider:'1'
		};

		$scope.computeShares = function(p_category) {
			return $scope.carParks.reduce(function(p_sum, p_carPark) {
				return p_sum + p_carPark.shares[p_category.name];
			}, $scope.apartment.shares[p_category.name]);
		};

		var computeTotal = function(p_amount) {
			var divider = parseInt($scope.data.divider);
			return p_amount / divider;
		};

		var computeShare = function(p_category, p_amount) {
			var shares = $scope.computeShares(p_category);
			return p_amount * shares / p_category.shares;
		};

		$scope.computeCategoryTotal = function(p_category) {
			return computeTotal(p_category.entries.reduce(function(p_sum, p_entry) {
				return p_sum + p_entry.amount[$scope.data.reference];
			}, 0));
		};

		$scope.computeCategoryShare = function(p_category) {
			return computeShare(p_category, $scope.computeCategoryTotal(p_category));
		};

		$scope.computeEntryTotal = function(p_entry) {
			return computeTotal(p_entry.amount[$scope.data.reference]);
		};

		$scope.computeEntryShare = function(p_category, p_entry) {
			return computeShare(p_category, $scope.computeEntryTotal(p_entry));
		};

		$scope.computeGrandTotal = function() {
			return $scope.serviceCharges.reduce(function(p_sum, p_category) {
				return p_sum + $scope.computeCategoryTotal(p_category);
			}, 0);
		};

		$scope.computeGrandTotalShare = function() {
			return $scope.serviceCharges.reduce(function(p_sum, p_category) {
				return p_sum + $scope.computeCategoryShare(p_category);
			}, 0);
		};
	}
]);