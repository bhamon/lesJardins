'use strict';

angular
.module('lesJardins')
.controller('lesJardins-channel-edit', [
	'$scope', 'channel',
	function($scope, p_channel) {
		$scope.channel = p_channel;
	}
]);