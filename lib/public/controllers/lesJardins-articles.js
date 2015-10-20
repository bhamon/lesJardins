'use strict';

angular
.module('lesJardins')
.controller('lesJardins-articles', [
	'$scope', '$state', '$stateParams', 'articles',
	function($scope, $state, $stateParams, p_articles) {
		$scope.articles = p_articles;
		$scope.page = $stateParams.page;
		$scope.size = $stateParams.size;

		$scope.previous = function() {
			$state.go('lesJardins.articles.list', {
				page:$stateParams.page - 1,
				size:$stateParams.size
			});
		};

		$scope.next = function() {
			$state.go('lesJardins.articles.list', {
				page:$stateParams.page + 1,
				size:$stateParams.size
			});
		};

		$scope.view = function(p_article) {
			$state.go('lesJardins.articles.article.view', {
				id:p_article.id
			});
		};
	}
]);