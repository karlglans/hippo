(function() {
    'use strict';

    angular
        .module('hippoApp')
        .factory('GameService', GameService);

    GameService.$inject = ['$q'];

    function GameService ($q) {
    	var service = {};
        
        //resultsFromScript = {gameid: $scope.gameid, score: 22, level: msg.endLevel};
        service.rateGame = function(resultsFromScript) {
        	var deferred = $q.defer();
        	
        	
        	// will resolve: {rating: 1000, startLevel: 10, gamesPlayed: 323}
        	
        	setTimeout(function(){
        		deferred.resolve({rating: 1000, startLevel: 10, gamesPlayed: 323});
        	}, 100);
        	return deferred.promise; 
        }
        
        service.signalStartGame = function(gameId) {
        	var deferred = $q.defer();
        	
        	setTimeout(function(){
        		deferred.resolve();
        	}, 100);
        	
        	return deferred.promise; 
        }

        return service;
    }
})();
