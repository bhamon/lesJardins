'use strict';

angular
.module('lesJardins')
.controller('lesJardins-notifications', [
	'$scope', '$state',
	function($scope, $state) {
		$scope.notifications = [
			{
				id:'123',
				date:new Date(),
				viewed:false,
				type:'council.subscription',
				message:'Test'
			},
			{
				id:'123',
				date:new Date(),
				viewed:false,
				type:'council.subscription',
				message:'Test'
			},
			{
				id:'123',
				date:new Date(),
				viewed:true,
				type:'council.subscription',
				message:'Test'
			}
		];
	}
]);