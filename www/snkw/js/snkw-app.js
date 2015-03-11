angular.module('snkwapp', [
    'ngAnimate',
    'ionic',
    'snkwapp.controllers',
    'cfp.loadingBar',
    'cfp.loadingBarInterceptor',
    'snkw'
])

.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = false;
}])

.config(['$snkwProvider', function($snkwProvider) {

    var getQueryParams = function(qs) {
        qs = qs.split("+").join(" ");

        var params = {}, tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[window.decodeURIComponent(tokens[1])]
                = window.decodeURIComponent(tokens[2]);
        }

        return params;
    }

    var appName = getQueryParams(window.location.search).appName;

    if(appName != null){
        $snkwProvider.setConfig({
            appName: appName
        });
    }

}])

.directive('onlyDigits', function () {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function (scope, element, attr, ngModel) {
            if ( ! ngModel){
                return;
            }

            ngModel.$parsers.unshift(function (inputValue) {
                var digits = inputValue.split('').filter(function (s) { return (!isNaN(s) && s != ' '); }).join('');
                ngModel.$viewValue = digits;
                ngModel.$render();
                return digits;
           });
        }
    };
})

.config(function($stateProvider, $urlRouterProvider, $snkwProvider) {

    $stateProvider
    .state('welcomeHome', {
        url: '/welcome/home',
        templateUrl: 'templates/welcome-home.html'
    })

    .state('welcomeNetwork', {
        url: '/welcome/network',
        templateUrl: 'templates/welcome-network.html'
    })

    .state('welcomeLogin', {
        url: '/welcome/login',
        templateUrl: 'templates/welcome-login.html'
    });

    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get('$state');
        var $snkw = $injector.get('$snkw');

        var serverConfig = $snkw.getServerConfig();

        if(serverConfig != null){
            $state.go('welcomeLogin');
        }else{
            $state.go('welcomeHome');
        }
    });
});