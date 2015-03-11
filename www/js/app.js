angular.module('app-exemplo', [
    'ngAnimate',
    'ionic',
    'cfp.loadingBar',
    'cfp.loadingBarInterceptor',
    'snkw',
    'app-exemplo.controllers',
])

.run(function($http, $state, $snkw) {
    ionic.Platform.ready(function(){  
    	if(navigator.splashscreen){
    		navigator.splashscreen.hide();
    	}
    });
})

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    //CfpLoadingBar é uma barra de loading que aparece automaticamente em cada requisição
	//Está embarcada no SNKW Framework - http://chieffancypants.github.io/angular-loading-bar/
	cfpLoadingBarProvider.includeSpinner = false;
}])

.config(function($stateProvider, $urlRouterProvider) {
    
	$stateProvider
    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: "templates/workspace.html"
    })

    .state('app.home', {
        url: '/home',
        views: {
            'content': {
                templateUrl: 'templates/home.html',
                controller: 'HomeCtrl'
            }
        }
    });

    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get('$state');
        var $snkw = $injector.get('$snkw');

        //Verificamos se existe configuração de conexão com o servidor
        var hasConnectionConfig = $snkw.hasConnectionConfig();

        if(hasConnectionConfig){
        	$state.go('app.home');
        }else{
            //Redirecionamos para que o SNKW Framework solicite as configurações
            $snkw.redirectToLogin();
        }
    });
});