angular.module('rentCarApp', ['appRoutes','registerCtrl', 'mainController', 
							  'userServices', 'authServices','offerServices', 'offerController', 'myOffersController']) 

.config(function($httpProvider){   //configure app to intercept all http requests with this factory we created which assigns token to header
	$httpProvider.interceptors.push('AuthEveryRequest');
});