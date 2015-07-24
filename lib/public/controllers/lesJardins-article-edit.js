'use strict';

angular
.module('lesJardins')
.controller('lesJardins-article-edit', [
	'$scope', '$state', '$element', '$mdToast', 'freyja-sessionHandler', 'article',
	function($scope, $state, $element, $mdToast, p_sessionHandler, p_article) {
		$scope.user = p_sessionHandler.getSession().data.user;
		$scope.article = p_article;
		$scope.now = new Date();

		$scope.data = {
			title:p_article.title,
			text:p_article.text
		};

		$scope.gotoBack = function() {
			$state.go('lesJardins.article.view', {
				id:p_article.id
			});
		};

		$scope.save = function(p_user) {
			if(!$scope.formArticle.$valid) {
				return;
			}

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