(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameHostController', GameHostController);

    GameHostController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', '$window', '$sce', 'GameService', 'gameData'];

    function GameHostController ($scope, Principal, LoginService, $state, $http, $window, $sce, GameService, gameData) {
        var vm = this, _scriptKey;

        vm.gameData = gameData; // resultFromServer {gameid: 1, title : "game 1", rating : 16001, played : 100, level:2, score: 22}
        vm.show_info = false;

		$window.onmessage = function(e){
			console.log("onmessage ", e.data, gameData.gameid);
			var msg = JSON.parse(e.data);
			if (msg.event == 'client_loaded' && msg.gameId == gameData.gameid) {
				vm.show_info = true;
			} else if (msg.event === 'game_over') {
				if (msg.key == _scriptKey) {
					vm.gameData.score = msg.score;
					var resultsFromScript = {gameid: gameData.gameid, score: msg.score, level: msg.endLevel};
					GameService.rateGame(resultsFromScript)
						.then( function success(resultFromServer) {  // {rating: 1000, startLevel: 10, gamesPlayed: 323}
							vm.gameData.played = resultFromServer.played; 
							vm.gameData.rating = resultFromServer.rating;
							vm.gameData.level = resultFromServer.level;
							vm.show_info = true;
						}, function rejected() {
							throw("server rejected");
						});
				} else { 
					throw("wrong key");
				}
			} else if (msg.event == 'client_loaded') {
				console.log('game loaded with wrong ID');
			}
		}

		$scope.getGameData = function() {
			console.log('getGameData');
			$http.get('/api/v1/game/list')
				.success(function(sss){
                    console.log('/api/v1/game/list', sss);
                });
		}


		
		
		$scope.frameId = "zma82vRVe18xbAqW"; // should be generated. ???
		// $scope.path = $sce.trustAsResourceUrl(GameList.getUriFromId($scope.gameid));
		$scope.path = $sce.trustAsResourceUrl(GameService.getGameURL(gameData.gameid)); // "http://localhost:8080/games/game1/index.html"

		$scope.onClickStart = function() {
			vm.show_info = false;
			GameService.signalStartGame(gameData.gameid)
				.then(function done(){ // fromServer
					_scriptKey = Math.random();
					var startMsg = {"msg" : "start", "level" : gameData.level, "scriptKey" : _scriptKey};
					var frameId = document.getElementById($scope.frameId).contentWindow;
					frameId.postMessage(JSON.stringify(startMsg), '*');
				},function problem(){
					throw("runGame() GameService rejected");
				});
		};
    }
})();
