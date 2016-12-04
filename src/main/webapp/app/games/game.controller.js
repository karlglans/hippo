(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameController', GameController);

    GameController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', '$window', '$sce', 'GameService'];

    function GameController ($scope, Principal, LoginService, $state, $http, $window, $sce, GameService) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
  
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

        var _scriptKey;
		$window.onmessage = function(e){
			var msg = JSON.parse(e.data);
			if (msg.event == 'client_loaded' && msg.gameId == $scope.gameid) {
			} else if (msg.event == 'game_over') {
				if (msg.key == _scriptKey) {
					var resultsFromScript = {gameid: $scope.gameid, score: 22, level: msg.endLevel};
					GameService.rateGame(resultsFromScript)
						.then( function success(resultFromServer) {  // {rating: 1000, startLevel: 10, gamesPlayed: 323}
							$scope.played = resultFromServer.gamesPlayed;
							$scope.rating = resultFromServer.rating;
							$scope.startLevel = resultFromServer.startLevel;
							$scope.show_info = true;
						}, function rejected() {
							throw("server rejected");
						});
				} else { 
					throw("wrong key");
				}
			}
		}

		$scope.show_info = true;
		$scope.gameid = 1; // preLoadedStats.gameid not api id
		$scope.rating = 1600; // preLoadedStats.rating
		$scope.played = 2; // preLoadedStats.gamesPlayed
		$scope.startLevel = 3; // preLoadedStats.startLevel
		$scope.frameId = "zma82vRVe18xbAqW"; // should be generated. ???
		// $scope.path = $sce.trustAsResourceUrl(GameList.getUriFromId($scope.gameid));
		$scope.path = $sce.trustAsResourceUrl("http://localhost:8080/games/game1/index.html");

		$scope.onClickStart = function() {
			$scope.show_info = false;
			GameService.signalStartGame($scope.gameid)
				.then(function done(fromServer){
					_scriptKey = Math.random();
					var startMsg = {"msg" : "start", "level" : $scope.startLevel, "scriptKey" : _scriptKey};
					var frameId = document.getElementById($scope.frameId).contentWindow;
					frameId.postMessage(JSON.stringify(startMsg), '*');
				},function problem(){
					throw("runGame() GameService rejected");
				});
		};
        
        
    }
})();
