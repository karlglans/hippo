(function() {
    'use strict';

    angular
        .module('hippoApp')
        .factory('GameService', GameService);

    GameService.$inject = ['$q', '$http'];

    function GameService ($q, $http) {
    	var service = {};
        var _gameKey = "";
        function makeRetKey (gameid, gameKey) {
            gameid = parseInt(gameid);
            return gameKey * (gameid + 2);
        }
        service.rateGame = function(resultsFromScript) {
        	var deferred = $q.defer();
            var gameResults = {endLevel : resultsFromScript.level, score: resultsFromScript.score};
            gameResults.key = makeRetKey(resultsFromScript.gameid, _gameKey);
            $http.post("/api/v1/game/register/" + resultsFromScript.gameid, gameResults)
                .success(function(sss){
                    deferred.resolve({rating: sss.rating, level: resultsFromScript.level, played: sss.played});
                });

        	return deferred.promise; 
        }
        service.signalStartGame = function(gameId) {
        	var deferred = $q.defer();
            $http.post("/api/v1/game/start/" + gameId)
                .success(function(resp){
                    _gameKey = parseInt(resp.key);
                    deferred.resolve();
                });
        	return deferred.promise; 
        }
        service.getGameURL = function(gammeId) {
            //return "http://localhost:8080/games/game" + gammeId + "/index.html";
            return "/games/game" + gammeId + "/index.html";
        }
        service.loadGameList = function() {
            var deferred = $q.defer();
            $http.get("/api/v1/game/list")
                .success(function(resp){
                    deferred.resolve(resp);
                });
            return deferred.promise; 
        }

        return service;
    }
})();
