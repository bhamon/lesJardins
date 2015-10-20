'use strict';

angular
.module('lesJardins')
.controller('lesJardins-channel-view', [
	'$scope', '$state', 'channel',
	function($scope, $state, p_channel) {
		$scope.channel = p_channel;

		$scope.gotoBack = function() {
			$state.go('lesJardins.channels.list');
		};

		$scope.edit = function(p_channel) {
			$state.go('lesJardins.channels.channel.edit', {
				id:p_channel.id
			});
		};
	}
]);