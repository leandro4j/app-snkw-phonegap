angular.module('app-exemplo.controllers',[])

.controller('MainCtrl', function($scope, cfpLoadingBar, $ionicPopup, $snkwService){
    
	$scope.showMessage = function(){
		$ionicPopup.alert({
            title: 'BOOH!',
            template: 'Até que em fim alguém me mostrou. Sou uma msg de teste!'
        });
	};
	
	$scope.logout = function(){
		var confirmPopup = $ionicPopup.confirm({
    		title: 'Saindo',
    		template: 'Deseja realmente sair?',
    		cancelText: 'Não',
    		okText: 'Sim'
    	});
    	
    	confirmPopup.then(function(resp) {
    		if(resp == true) {
    			//Utilizamos esse método do SNKW Framework para fazer o logout no servidor e ir para tela de login.
    			$snkwService.logout();
    	    }
    	});
	};
	
	//Esse evento do Ionic para sempre esconder a barra de loading antes de sair de cada tela.
    $scope.$on('$ionicView.beforeLeave', function(){
        cfpLoadingBar.complete();
    });
})

.controller('HomeCtrl', function($scope, $snkwService, $ionicPopup) {

    $scope.recentScreens = [];

    //Esse evento do Ionic para saber quando a tela for carregada para fazer a chamada de serviço.
    $scope.$on('$ionicView.loaded', function(){
        $scope.loadRecentScreens();
    });
    
    $scope.doRefresh = function(){
    	$scope.loadRecentScreens();
    };
    
    $scope.loadRecentScreens = function(){

    	//Utilizamos o $snkwService para fazer as chamadas de serviço para o Sankhya-W.
        $snkwService.callService({
            service: 'WorkspaceSP.getAbertasRecentemente',
            callback: {
                success: function(data){
                    var result = angular.fromJson(data.json.__cdata);
                    $scope.recentScreens = result;

                    //Disparamos esse evento do Ionic para dizer que a ação de refresh terminou.
                    $scope.$broadcast('scroll.refreshComplete');
                },
                error: function(msg, status, headers, config){
                    $scope.$broadcast('scroll.refreshComplete');

                    $ionicPopup.alert({
                        title: 'Oops!',
                        template: msg
                    });
                }
            }
        });
    };
});