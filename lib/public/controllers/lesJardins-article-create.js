'use strict';

angular
.module('lesJardins')
.controller('lesJardins-newsEntry-view', [
	'$scope', '$state', 'newsEntry',
	function($scope, $state, p_newsEntry) {
		$scope.newsEntry = p_newsEntry;

		$scope.edit = function() {
			$state.go('lesJardins.newsEntry.edit', {
				id:p_newsEntry.id
			});
		};
	}
]);