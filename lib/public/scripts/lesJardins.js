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
		.state('logIn', {
			url:'/logIn',
			views:{
				header:{
					templateUrl:p_config.templatesPath + '/lesJardins-header.html'
				},
				main:{
					template:'<div></div>',
					controller:[
						'$state', 'freyja-sessionHandler', '$mdDialog', '$scope',
						function($state, p_sessionHandler, $mdDialog, $scope) {
							p_sessionHandler.recover()
							.then(function() {
								$state.go('lesJardins.articles');
							});
						}
					]
				}
			}
		})
		.state('lesJardins', {
			abstract:true,
			resolve:{
				session:[
					'$state', 'freyja-sessionHandler',
					function($state, p_sessionHandler) {
						p_sessionHandler.init()
						.catch(function() {
							$state.go('logIn');
						});
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
		.state('lesJardins.notifications', {
			url:'/notifications',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-notifications.html',
					controller:'lesJardins-notifications'
				}
			}
		})
		.state('lesJardins.articles', {
			url:'/articles',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-articles.html',
					controller:'lesJardins-articles'
				}
			}
		})
		.state('lesJardins.articles.create', {
			url:'/create',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-article-create.html',
					controller:'lesJardins-article-create'
				}
			}
		})
		.state('lesJardins.article', {
			abstract:true,
			url:'/article',
			resolve:{
				article:[
					'lesJardins-api-article', 'lesJardins-api-user',
					function(p_apiArticle, p_apiUser) {
// TODO: update this when the back is done
						return {
							id:'1234',
							date:new Date(),
							author:{
								firstName:'John',
								lastName:'Doe'
							},
							title:'Test',
							text:'Text',
							comments:[
								{
									date:new Date(),
									author:{
										firstName:'Jane',
										lastName:'Doe'
									},
									text:'Chouette nouvelle =D'
								},
								{
									date:new Date(),
									author:{
										firstName:'John',
										lastName:'Doe'
									},
									text:'Non c\'est **nul** :p'
								}
							]
						};
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
		.state('lesJardins.contact', {
			url:'/contact',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-contact.html',
					controller:'lesJardins-contact'
				}
			}
		})
		.state('lesJardins.admin', {
			abstract:true,
			url:'/admin'
		})
		.state('lesJardins.admin.settings', {
			url:'/settings',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-settings.html',
					controller:'lesJardins-admin-settings'
				}
			}
		})
		.state('lesJardins.admin.users', {
			url:'/users',
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
		.state('lesJardins.admin.user', {
			abstract:true,
			url:'/user/:id',
			resolve:{
				user:[
					'lesJardins-api-user',
					function(p_api) {
// TODO: update this when the back is done
						return {
							id:'1234',
							email:'jane.doe@domain.com',
							firstName:'Jane',
							lastName:'Doe',
							apartment:{
								building:'A',
								number:32
							}
						};
					}
				]
			}
		})
		.state('lesJardins.admin.user.view', {
			url:'/view',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-user-view.html',
					controller:'lesJardins-admin-user-view'
				}
			}
		})
		.state('lesJardins.admin.user.edit', {
			url:'/edit',
			views:{
				'main@':{
					templateUrl:p_config.templatesPath + '/lesJardins-admin-user-edit.html',
					controller:'lesJardins-admin-user-edit'
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
// TODO: uncomment when server done
/*
				return p_apiSession.get({token:p_session.token}).$promise
				.then(function(p_data) {
					p_session.addRights(p_data.rights);

					return p_apiUser.get({id:p_data.user}).$promise;
				})
				.then(function(p_data) {
					p_session.data.user = p_data;
				});
*/
				var session = p_sessionHandler.getSession();
				session.data.user = {
					id:'1234',
					email:'jane.doe@domain.com',
					firstName:'Jane',
					lastName:'Doe'
				};
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
			'lesJardins-api-session',
			function(p_apiSession) {
// TODO: uncomment when server done
//				return p_apiSession.remove({token:p_session.getSession().token}).$promise;
			}
		]);
	}
])
.run([
	'$rootScope',
	function($rootScope) {
// TODO: debug, remove for production
		$rootScope.$on('$stateChangeError',function(event, toState, toParams, fromState, fromParams, error){
			console.log('$stateChangeError - fired when an error occurs during transition.');
			console.log(arguments);
		});
	}
]);