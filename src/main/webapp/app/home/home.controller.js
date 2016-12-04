(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http'];

    function HomeController ($scope, Principal, LoginService, $state, $http) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        vm.addPlayerStats = addPlayerStats;
//        vm.registerGame = registerGame;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });
        
        var gameKey, gameId = 1, isStarted = false;

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }
        function register () {
            $state.go('register');
        }
        function addPlayerStats () {
        	if(isStarted == false) {
        		$http.post("/api/v1/game/start/" + gameId)
        		.success(function(resp){
        			console.log("succsess()", resp);
        			isStarted = true;
        			gameKey = resp.key;
        		});
        		console.log("api/v1/game/start");
        	} else {
  
        		var gameResults = {endLevel : 5, score: 123};
        		gameResults.key = makeRetKey(gameId, gameKey);
        		$http.post("/api/v1/game/register/" + gameId, gameResults)
        		.success(function(sss){
        			console.log("register game", sss);
        			isStarted = false;
        		});
        	}
        }
        
        function makeRetKey (gameid, gameKey) {
        	return gameKey * (gameid + 2);
        }
        
//        function registerGame () {
//        	var reqBody = {endLevel: 12, score:299, key:21 };
//        	$http.post("/api/v1/game/register/1/", reqBody)
//        		.success(function(){
//        			console.log("succsess()");
//        		});
//        	
//        	console.log("api/v1/game/register");
//        }
        
        
    }
})();
