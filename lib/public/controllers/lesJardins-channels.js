'use strict';

angular
.module('lesJardins')
.controller('lesJardins-channels', [
	'$scope', '$element', '$state', '$mdToast', 'channels',
	function($scope, $element, $state, $mdToast, p_channels) {
		$scope.channels = p_channels;
/*
		[
			{
				id:'1234',
				date:new Date(),
				author:{
					id:'1234',
					firstName:'Jane',
					lastName:'Doe'
				},
				title:'Les travaux en cours',
				stats:{
					read:12,
					replies:3
				}
			},
			{
				id:'1234',
				date:new Date(),
				author:{
					id:'1234',
					firstName:'Jane',
					lastName:'Doe'
				},
				title:'Nouveau Syndic...',
				stats:{
					read:11,
					replies:8
				}
			}
		];
*/

		$scope.add = function() {
			$state.go('lesJardins.channels.create');
		};

		$scope.view = function(p_topic) {
			$state.go('lesJardins.channels.channel.view', {
				id:p_topic.id
			});
		};

		$scope.remove = function(p_topic) {
			$mdToast.show(
				$mdToast.simple()
				.content('Sujet supprimé.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);