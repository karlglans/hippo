(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameHostController', GameHostController);

    GameHostController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', '$window', '$sce', 'GameService', 'gameData'];

    function GameHostController ($scope, Principal, LoginService, $state, $http, $window, $sce, GameService, game) {
        var vm = this, _scriptKey; 

        console.log("gameData", game); // gameData
        vm.game = game; 
        vm.show_info = false;

		$window.onmessage = function(e){
			console.log("onmessage ", e.data, game.gameId);
			var msg = JSON.parse(e.data);
			if (msg.event == 'client_loaded' && msg.gameId == game.gameId) {
				vm.show_info = true;
			} else if (msg.event === 'game_over') {
				if (msg.key == _scriptKey) {
					vm.game.score = msg.score; // <-- score is introduced here
					var resultsFromScript = {gameid: game.gameId, score: msg.score, level: msg.endLevel};
					GameService.rateGame(resultsFromScript)
						.then( function success(resultFromServer) {  // {rating: 1000, startLevel: 10, gamesPlayed: 323}
							vm.game.nGamesPlayed = resultFromServer.played; 
							vm.game.rating = resultFromServer.rating;
							vm.game.level = resultFromServer.level;
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
		$scope.path = $sce.trustAsResourceUrl(GameService.getGameURL(game.gameId)); // "http://localhost:8080/games/game1/index.html"

		$scope.onClickStart = function() {
			vm.show_info = false;
			GameService.signalStartGame(game.gameId)
				.then(function done(){ // fromServer
					_scriptKey = Math.random();
					var startMsg = {"msg" : "start", "level" : game.level, "scriptKey" : _scriptKey};
					var frameId = document.getElementById($scope.frameId).contentWindow;
					frameId.postMessage(JSON.stringify(startMsg), '*');
				},function problem(){
					throw("runGame() GameService rejected");
				});
		};
    }
})();
