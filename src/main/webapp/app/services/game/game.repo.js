(function () {
    'use strict';

    angular
        .module('hippoApp')
        .factory('GameRepo', GameRepo);

    GameRepo.$inject = ['$q', '$http'];

    function Game(title, titleShort, gameId) {
		this.title = title;
		this.gameId = gameId;
		this.titleShort = titleShort; // fit for URI
		this.nGamesPlayed = 0;
		this.rating = 0;
		this.level = 0;
	}

	Game.prototype.updateAfterRating = function(nGamesPlayed, rating, level) {
		this.nGamesPlayed = nGamesPlayed;
		this.rating = rating;
		this.lastScore = level;
	}

    function GameRepo ($q, $http) {
    	var exp = {};
    	var gameStats = null;
    	exp.makeGameStats = function(gameList) {
            // if(!gameList || gameList.length < 2 || Object.getOwnPropertyNames(gameList).length === 0)
            //     return;

    		var c = 0;
    		gameStats = new Array();
    		gameList.forEach(function(e){
    			var game = new Game(e.gameTitle, e.gameTitleShort, e.gameId);
                game.rating = e.rating;
                game.nGamesPlayed = e.nGamesPlayed;
                game.level = e.endLevel;
    			gameStats[e.gameId] = game;
    			c++;
    		});
    		gameStats = gameStats.filter(function(n){ return n != undefined }); 
    		console.log("downloaded data for "+ c + " games");
    	}

    	exp.findGameById = function(gameId) {
    		return gameStats[gameId];
    	}

    	exp.downloadStats = function() {
    		var deferred = $q.defer();
    		if(!!gameStats) {
    			deferred.resolve(gameStats);
    		} else {
	            $http.get("/api/v1/game/list")
	                .success(function(resp) {
	                	exp.makeGameStats(resp);
	                	deferred.resolve(gameStats);
	                });
	   		}
            return deferred.promise; 
    	}

    	exp.findGameByName = function(gameNameShort) {

    		var game = new Game("unknown", "unknown", -1);
    		console.log("GameRepo:findGameByName()");
    		gameStats.forEach(function(e){
    			if(e.titleShort == gameNameShort)
    				game = e;
    		});
    		return game;
    	}

    	exp.getGameInfo = function(gameNameShort) {
            // TODO: maybe get the same data from _gameList
            var game = exp.findGameByName(gameNameShort);
            //debugger;
            console.log("GameRepo::getGameInfo() ", game);
            var deferred = $q.defer();
            $http.get("/api/v1/game/stats/" + game.gameId)
                .success(function(resp){
                    var game = new Game(resp.title, "nameshort", resp.gameid);
                    game.rating = resp.rating;
                    game.nGamesPlayed = resp.played;
                    game.level = resp.level;
                    console.log("stats for game: ", game);
                    deferred.resolve(game);
                });
            return deferred.promise;
        }


    	
    	return exp;
    }
})();