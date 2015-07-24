'use strict';

angular
.module('lesJardins')
.controller('lesJardins-articles', [
	'$scope', '$state',
	function($scope, $state) {
		$scope.articles = [
			{
				id:'1234',
				date:new Date(Date.now() - 1000 * 3600 * 5),
				author:{
					firstName:'Jane',
					lastName:'Doe'
				},
				title:'Etat des lieux des différents travaux',
				text:'Ci-dessous l\'avancement des travaux de réparation constatés lors de l\'état des lieux :\n* Jardin : 20%\n* Escalier bâtiment A : 100%'
			},
			{
				id:'5678',
				date:new Date(Date.now() - 1000 * 3600 * 24 * 2),
				author:{
					firstName:'John',
					lastName:'Doe'
				},
				title:'Journées porte ouverte à la résidence',
				text:'Veuillez prendre note que le **08/08** aura lieu une journée porte ouverte dans notre résidence. A cette occasion, Expansiel passera dans chacun des logements afin de lever les réserves (marquées JPO).'
			},
			{
				id:'5678',
				date:new Date(Date.now() - 1000 * 3600 * 24 * 2),
				author:{
					firstName:'John',
					lastName:'Doe'
				},
				title:'Journées porte ouverte à la résidence',
				text:'Veuillez prendre note que le **08/08** aura lieu une journée porte ouverte dans notre résidence. A cette occasion, Expansiel passera dans chacun des logements afin de lever les réserves (marquées JPO).'
			},
			{
				id:'5678',
				date:new Date(Date.now() - 1000 * 3600 * 24 * 2),
				author:{
					firstName:'John',
					lastName:'Doe'
				},
				title:'Journées porte ouverte à la résidence',
				text:'Veuillez prendre note que le **08/08** aura lieu une journée porte ouverte dans notre résidence. A cette occasion, Expansiel passera dans chacun des logements afin de lever les réserves (marquées JPO).'
			},
			{
				id:'5678',
				date:new Date(Date.now() - 1000 * 3600 * 24 * 2),
				author:{
					firstName:'John',
					lastName:'Doe'
				},
				title:'Journées porte ouverte à la résidence',
				text:'Veuillez prendre note que le **08/08** aura lieu une journée porte ouverte dans notre résidence. A cette occasion, Expansiel passera dans chacun des logements afin de lever les réserves (marquées JPO).'
			}
		];

		$scope.view = function(p_article) {
			$state.go('lesJardins.article.view', {
				id:p_article.id
			});
		};
	}
]);