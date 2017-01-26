'use strict';

describe('Service Tests', function () {
    beforeEach(mockApiCall);
    beforeEach(mockScriptsCalls);
    beforeEach(mockScriptsCalls);

    xdescribe('Game', function () {
        var $httpBackend, GameService, $q;

        beforeEach(inject(function($injector, _$q_) {
            $httpBackend = $injector.get('$httpBackend');
            $q = _$q_;
            GameService = $injector.get('GameService');
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('should give an url', function(){
            //GIVEN
            var someGameId = 3;
            var res = GameService.getGameURL(someGameId);

            $httpBackend.flush();

            //THEN
            expect(res).toBe("/games/game" + someGameId + "/index.html");
        });
    });
});