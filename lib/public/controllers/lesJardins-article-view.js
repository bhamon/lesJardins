'use strict';

angular
.module('lesJardins')
.controller('lesJardins-article-view', [
	'$scope', '$element', '$state', '$mdToast', 'freyja-sessionHandler', 'article',
	function($scope, $element, $state, $mdToast, p_sessionHandler, p_article) {
		$scope.user = p_sessionHandler.getSession().data.user;
		$scope.article = p_article;
		$scope.now = new Date();

		$scope.data = {
			text:''
		};

		$scope.gotoBack = function() {
			$state.go('lesJardins.articles');
		};

		$scope.edit = function() {
			$state.go('lesJardins.article.edit', {
				id:p_article.id
			});
		};

		$scope.comment = function() {
			if(!$scope.formComment.$valid) {
				return;
			}

			$scope.article.comments.push({
				date:new Date(),
				author:$scope.user,
				text:$scope.data.text
			});

			$scope.data.text = '';
			$scope.formComment.$setUntouched();

			$mdToast.show(
				$mdToast.simple()
				.content('Commentaire ajouté.')
				.position('top right')
				.parent($element)
				.hideDelay(3000)
			);
		};
	}
]);