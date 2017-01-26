'use strict';

describe('Service Tests', function () {
    beforeEach(mockApiCall);
    beforeEach(mockScriptsCalls);
    beforeEach(mockScriptsCalls);

    describe('GameRepo', function () {
        var $httpBackend, GameRepo, $q;

        beforeEach(inject(function($injector, _$q_) {
            $httpBackend = $injector.get('$httpBackend');
            $q = _$q_;
            GameRepo = $injector.get('GameRepo');
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        xit('can find a game by id', function(){
            //GIVEN
            var listFromServer = [{endLevel: 13, gameId:1, gameTitle:"game1", gameTitleShort:"rutor", nGamesPlayed:6, rating:1500}];

            // ACT
            GameRepo.makeGameStats(listFromServer);
            $httpBackend.flush();
            var game = GameRepo.findGameById(1);

            //THEN
            expect(game.title).toBe("game1");
        });
    });
});