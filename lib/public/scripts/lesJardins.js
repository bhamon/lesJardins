'use strict';

angular
.module('lesJardins', ['ui.router', 'ngResource', 'ngCookies', 'ngMessages', 'ngMaterial', 'hc.marked', 'freyja'])
.constant('lesJardins-config', {
	templatesPath:'/templates',
	directivesPath:'/directives',
	apiPath:'/api',
	sessionCookie:'sessionToken'
})
.config([
	'$locationProvider', '$urlRouterProvider', '$stateProvider', '$mdThemingProvider', 'lesJardins-config', 'freyja-sessionHandlerProvider',
	function($locationProvider, $urlRouterProvider, $stateProvider, $mdThemingProvider, p_config, p_sessionHandlerProvider) {
		$locationProvider.html5Mode(true);
		$urlRouterProvider.otherwise('/articles');

		$stateProvider
		.state('lesJardins', {
			abstract:true,
			resolve:{
				session:[
					'freyja-sessionHandler',
					function(p_sessionHandler) {
						p_sessionHandler.init();
					}
				]
			},
			views:{
				header:{
					templateUrl:p_config.templatesPath + '/lesJardins-header.html',
					controller:'lesJardins-header'
				},
				sidenav:{
					templateUrl:p_config.templatesPath + '/lesJardins-sidenav.html',
					controller:'lesJardins-sidenav'
				}
			}
		})
		.state('lesJardins.articles', {
			abstract:true,
			url:'/articles'
		})
		.state('lesJardins.articles.list', {
			url:'?page&size',
			resolve:{
				articles:[
					'$q', '$stateParams', 'lesJardins-api-article', 'lesJardins-api-user',
					function($q, $stateParams, p_apiArticle, p_apiUser) {
						$stateParams.page = parseInt($stateParams.page) || 0;
						$stateParams.size = parseInt($stateParams.size) || 10;

						return p_apiArticle.query({
							page:$stateParams.page,
							size:$stateParams.size
						}).$promise
						.then(function(p_articles) {
							return $q.all(angular.forEach(function(p_article) {
								return p_apiUser.get({id:p_article.author}).$promise
								.then(function(p_author) {
									p_article.author = p_author;
								});
							}))
							.then(function() {
								return p_articles;
							});
						});
					}
				]
			},
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-articles.html',
					controller:'lesJardins-articles'
				}
			}
		})
		.state('lesJardins.articles.create', {
			url:'/new',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-article-create.html',
					controller:'lesJardins-article-create'
				}
			}
		})
		.state('lesJardins.articles.article', {
			abstract:true,
			url:'/:article',
			resolve:{
				article:[
					'$q', '$stateParams', 'lesJardins-api-article', 'lesJardins-api-user',
					function($q, $stateParams, p_apiArticle, p_apiUser) {
						return p_apiArticle.get({
							article:$stateParams.article
						}).$promise
						.then(function(p_article) {
							return p_apiUser.get({user:p_article.author}).$promise
							.then(function(p_author) {
								p_article.author = p_author;
								return p_article;
							});
						});
					}
				]
			}
		})
		.state('lesJardins.article.view', {
			url:'/view',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-article-view.html',
					controller:'lesJardins-article-view'
				}
			}
		})
		.state('lesJardins.article.edit', {
			url:'/edit',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-article-edit.html',
					controller:'lesJardins-article-edit'
				}
			}
		})
		.state('lesJardins.profile', {
			url:'/profile',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-profile.html',
					controller:'lesJardins-profile'
				}
			}
		})
		.state('lesJardins.channels', {
			abstract:true,
			url:'/channels'
		})
		.state('lesJardins.channels.list', {
			url:'?page&size',
			resolve:{
				channels:[
					'$stateParams', 'lesJardins-api-channel',
					function($stateParams, p_apiChannel) {
						$stateParams.page = parseInt($stateParams.page) || 0;
						$stateParams.size = parseInt($stateParams.size) || 10;

						return p_apiChannel.query({
							page:$stateParams.page,
							size:$stateParams.size
						}).$promise;
					}
				]
			},
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-channels.html',
					controller:'lesJardins-channels'
				}
			}
		})
		.state('lesJardins.channels.create', {
			url:'/new',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-channel-create.html',
					controller:'lesJardins-channel-create'
				}
			}
		})
		.state('lesJardins.channels.channel', {
			abstract:true,
			url:'/:channel',
			resolve:{
				channel:[
					'$stateParams', 'lesJardins-api-channel',
					function($stateParams, p_api) {
// TODO: update this when the back is done
						return {
							id:'1234',
							date:new Date(),
							author:{
								id:'1234',
								firstName:'Jane',
								lastName:'Doe'
							},
							title:'Les travaux en cours',
							text:'Une petite explication sur le sujet :p\n* Liste de choix\n* Un autre élément\n* Et un dernier pour la route',
							stats:{
								read:12,
								replies:3
							}
						};
					}
				]
			}
		})
		.state('lesJardins.channel.view', {
			url:'/view',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-channel-view.html',
					controller:'lesJardins-channel-view'
				}
			}
		})
		.state('lesJardins.channel.edit', {
			url:'/edit',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-channel-edit.html',
					controller:'lesJardins-channel-edit'
				}
			}
		})
		.state('lesJardins.contact', {
			url:'/contact',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-contact.html',
					controller:'lesJardins-contact'
				}
			}
		})
		.state('lesJardins.serviceCharges', {
			url:'/serviceCharges',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-serviceCharges.html',
					controller:'lesJardins-serviceCharges'
				}
			}
		})
		.state('lesJardins.admin', {
			abstract:true,
			url:'/admin'
		})
		.state('lesJardins.admin.params', {
			url:'/params',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-params.html',
					controller:'lesJardins-admin-params'
				}
			}
		})
		.state('lesJardins.admin.users', {
			abstract:true,
			url:'/users'
		})
		.state('lesJardins.admin.users.list', {
			url:'?page&size',
			resolve:{
				users:[
					'$stateParams', 'lesJardins-api-user',
					function($stateParams, p_apiUser) {
						$stateParams.page = parseInt($stateParams.page) || 0;
						$stateParams.size = parseInt($stateParams.size) || 10;

						return p_apiUser.query({
							page:$stateParams.page,
							size:$stateParams.size
						}).$promise;
					}
				]
			},
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-users.html',
					controller:'lesJardins-admin-users'
				}
			}
		})
		.state('lesJardins.admin.users.create', {
			url:'/new',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-user-create.html',
					controller:'lesJardins-admin-user-create'
				}
			}
		})
		.state('lesJardins.admin.users.user', {
			abstract:true,
			url:'/:user',
			resolve:{
				user:[
					'$stateParams', 'lesJardins-api-user',
					function($stateParams, p_apiUser) {
						return p_apiUser.get({
							user:$stateParams.user
						}).$promise;
					}
				]
			}
		})
		.state('lesJardins.admin.users.user.view', {
			url:'/view',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-user-view.html',
					controller:'lesJardins-admin-user-view'
				}
			}
		})
		.state('lesJardins.admin.users.user.edit', {
			url:'/edit',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-user-edit.html',
					controller:'lesJardins-admin-user-edit'
				}
			}
		})
		.state('lesJardins.admin.buildings', {
			url:'/buildings',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-buildings.html',
					controller:'lesJardins-admin-buildings'
				}
			}
		})
		.state('lesJardins.admin.buildings.create', {
			url:'/new',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-building-create.html',
					controller:'lesJardins-admin-building-create'
				}
			}
		})
		.state('lesJardins.admin.building', {
			abstract:true,
			url:'/building/:id',
			resolve:{
				building:[
					'lesJardins-api-lot',
					function(p_api) {
// TODO: update this when the back is done
						return {
							id:'1234',
							name:'A',
							apartments:[
								{id:'1234', number:1, floor:1, shares:{
									common:0,
									stairwell:0,
									elevator:0
								}}
							],
							serviceCharges:[
								{name:'EDF', value:2365.2}
							],
							doorCode:'2120',
							elevator:true
						};
					}
				]
			}
		})
		.state('lesJardins.admin.building.view', {
			url:'/view',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-building-view.html',
					controller:'lesJardins-admin-building-view'
				}
			}
		})
		.state('lesJardins.admin.building.edit', {
			url:'/edit',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-building-edit.html',
					controller:'lesJardins-admin-building-edit'
				}
			}
		})
		.state('lesJardins.notifications', {
			url:'/notifications',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-notifications.html',
					controller:'lesJardins-notifications'
				}
			}
		})
		.state('lesJardins.help', {
			url:'/help',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-help.html'
				}
			}
		});

		$mdThemingProvider
			.theme('default')
			.primaryPalette('blue-grey')
			.accentPalette('orange')
			.warnPalette('red');

		$mdThemingProvider
			.theme('dark', 'default')
			.primaryPalette('orange')
			.accentPalette('purple')
			.warnPalette('red')
			.dark();

		p_sessionHandlerProvider.setCookieName(p_config.sessionCookie);

		p_sessionHandlerProvider.attachSessionHook('populate', [
			'lesJardins-config', 'lesJardins-api-session', 'lesJardins-api-user', 'freyja-sessionHandler',
			function(p_config, p_apiSession, p_apiUser, p_sessionHandler) {
				var session = p_sessionHandler.getSession();
				return p_apiSession.get({token:session.token}).$promise
				.then(function(p_data) {
					angular.forEach(p_data.rights, function(p_right) {
						session.addRight(p_right);
					});

					return p_apiUser.get({user:p_data.data.user}).$promise;
				})
				.then(function(p_data) {
					session.data.user = p_data;
				});
			}
		]);

		p_sessionHandlerProvider.attachSessionHook('recover', [
			'$mdDialog',
			function($mdDialog) {
				return $mdDialog.show({
					templateUrl:p_config.templatesPath + '/lesJardins-logIn.html',
					controller:'lesJardins-logIn',
					escapeToClose:false
				});
			}
		]);

		p_sessionHandlerProvider.attachSessionHook('remove', [
			'lesJardins-api-session', 'freyja-sessionHandler',
			function(p_apiSession, p_sessionHandler) {
				return p_apiSession.remove({token:p_sessionHandler.getSession().token}).$promise;
			}
		]);
	}
])
.run([
	'$rootScope',
	function($rootScope) {
		// TODO: debug, remove for production
		$rootScope.$on('$stateChangeError',function(p_event, p_toState, p_toParams, p_fromState, p_fromParams, p_error){
			console.log('$stateChangeError - fired when an error occurs during transition.');
			console.log(arguments);
		});
	}
]);