angular.module('snkwapp.controllers',[])

.controller('MainCtrl', function($scope, cfpLoadingBar, $window){

    $scope.open = function(url){
        // open the page in the inAppBrowser plugin. Falls back to a blank page if the plugin isn't installed
        var params = 'location=no,' +
            'enableViewportScale=yes,' +
            'toolbarposition=top,' +
            'closebuttoncaption=Done';

        var iab = window.open(url,'_blank',params);

        iab.addEventListener('exit', function() {
            iab.removeEventListener('exit', argument.callee);
            iab.close();
            iab = null;
        });
    };

    //make sure we always clear any existing loading bars before navigation
    $scope.$on('$ionicView.beforeLeave', function(){
        cfpLoadingBar.complete();
    });

    $window.addEventListener("resize", function(){
        $scope.windowHeight = Math.max(450, document.documentElement.clientHeight) + 'px';
        $scope.$apply();
    });

    $scope.windowHeight = Math.max(450, document.documentElement.clientHeight) + 'px';
})

.controller('WelcomeHomeCtrl', function($scope, $state, $snkw) {

    $scope.pageName = 'Home';
    $scope.appName = $snkw.appName;

    $scope.startConfig = function(){
        $state.go('welcomeNetwork');
    };
})

.controller('WelcomeNetworkCtrl', function($scope, $state, $timeout, $snkw, $snkwService, $ionicPopup, cfpLoadingBar) {

    $scope.pageName = 'Network';
    $scope.serverConfig = $snkw.getServerConfig();
    $scope.connectionTimeout = 15000;
    $scope.testingConnection = false;
    $scope.connectionLabel = 'Pronto';

    if($scope.serverConfig != null){
        $scope.protocol = $scope.serverConfig.protocol;
        $scope.address = $scope.serverConfig.address;
        $scope.port = $scope.serverConfig.port;
    }else{
        $scope.protocol = '*';
        $scope.address = null;
        $scope.port = null;
    }
    
    $scope.resetFlags = function(){
    	$scope.testingConnection = false;
        $scope.connectionLabel = 'Pronto';
    };
    
    $scope.throwConnectionError = function(){
    	$ionicPopup.alert({
            title: 'Oops, Sem conexão',
            template: '<div>Verifique se você está conectado a Internet ou se os dados do servidor estão corretos.</div>'
        });
    };

    $scope.startLogin = function(){
        console.log('Config Servidor {protocol = ' + $scope.protocol + ', address = ' + $scope.address + ', port = ' + $scope.port, '}');

        if($scope.testingConnection){
            return;
        }

        if($scope.protocol == "*"){
            $ionicPopup.alert({
                title: 'Oops!',
                template: 'Informe o <b>Tipo de Conexão</b> com o servidor.'
            });

            return;
        }

        if($scope.address == null || $scope.address.length == 0){
            $ionicPopup.alert({
                title: 'Oops!',
                template: 'Informe o <b>Endereço</b> ou <b>IP</b> do servidor.'
            });

            return;
        }

        $scope.address = $scope.address.replace('http://','');
        $scope.address = $scope.address.replace('https://','');

        $scope.serverConfig = {
            protocol: $scope.protocol,
            address: $scope.address,
            port: $scope.port
        };

        $snkw.setServerConfig($scope.serverConfig);

        $scope.testingConnection = true;
        $scope.connectionLabel = 'Conectando...';

        $timeout.cancel($scope.fallbackTimeoutPromise);
        
        //Esse fallback timeout é utilizado porque alguns endereços
        //bloqueiam as chamadas do $http sem lançar erro.
        $scope.fallbackTimeoutPromise = $timeout(function(){
        	if($scope.testingConnection){
	        	$scope.resetFlags();
	        	$scope.throwConnectionError();
	        	cfpLoadingBar.complete();
        	}
        }, $scope.connectionTimeout + 5000);
        
        /* Teste de conexão com o servidor */
        $snkwService.callService({
            service: 'MobileLoginSP.logout',
            callback: {
                success: function(data){
                	$scope.resetFlags();

                    console.log('Teste de conexão Ok!');

                    $state.go('welcomeLogin');
                },
                error: function(msg, status, headers, config){
                	$scope.resetFlags();

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: msg
                    });
                },
                httpError: function(data, status, headers, config){
                	$scope.resetFlags();
                	$scope.throwConnectionError();

                    return true;
                }
            },
            timeout: $scope.connectionTimeout
        });
    };
})

.controller('WelcomeLoginCtrl', function($scope, $state, $snkw, $snkwService, $ionicPopup, $window, Base64) {

    $scope.pageName = 'Login';
    $scope.appName = $snkw.appName;
    $scope.loginRunning = false;
    $scope.userName = $snkw.getStoreItem('lastUser');
    $scope.password = null;

    $scope.login = function(){

        if($scope.userName == null){
            $ionicPopup.alert({
                title: 'Oops!',
                template: 'Informe o <b>Usuário</b> para entrar.'
            });

            return;
        }

        $scope.loginRunning = true;
        $snkw.setStoreItem('lastUser', $scope.userName);

        var data = {NOMUSU: $scope.userName, INTERNO: $scope.password, KEEPCONNECTED: true};

        $snkwService.callService({
            service: 'MobileLoginSP.login',
            params: data,
            timeout: 60000,
            callback: {
                success: function(data){
                    $scope.loginRunning = false;

                    var userID = Base64.doDecode(data.idusu, false);
                    $snkw.setStoreItem('userID', userID);
                    
                    if(data.kID != null){
                    	var kID = Base64.doDecode(data.kID, false);
                        $snkw.setStoreItem('kID', kID);	
                    }

                    var mgeSession = data.jsessionid;
                    $snkw.setMgeSessionId(mgeSession);

                    $snkw.redirectToApp();
                },
                error: function(msg, status, headers, config){
                    $scope.loginRunning = false;

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: msg
                    });
                },
                httpError: function(data, status, headers, config){
                    $scope.loginRunning = false;

                    $ionicPopup.alert({
                        title: 'Oops, Sem conexão',
                        template: '<div>Verifique se você está conectado a Internet ou se os dados do servidor estão corretos.</div>'
                    });

                    return true;
                }
            }
        });
    };

    $scope.configNetwork = function(){
        $state.go('welcomeNetwork');
    };
});