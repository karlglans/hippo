'use strict';

describe('Controller Tests', function() {

    describe('PlayerGameStats Management Detail Controller', function() {
        var $scope, $rootScope;
        var MockEntity, MockPreviousState, MockPlayerGameStats, MockUser, MockGame;
        var createController;

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            $scope = $rootScope.$new();
            MockEntity = jasmine.createSpy('MockEntity');
            MockPreviousState = jasmine.createSpy('MockPreviousState');
            MockPlayerGameStats = jasmine.createSpy('MockPlayerGameStats');
            MockUser = jasmine.createSpy('MockUser');
            MockGame = jasmine.createSpy('MockGame');
            

            var locals = {
                '$scope': $scope,
                '$rootScope': $rootScope,
                'entity': MockEntity,
                'previousState': MockPreviousState,
                'PlayerGameStats': MockPlayerGameStats,
                'User': MockUser,
                'Game': MockGame
            };
            createController = function() {
                $injector.get('$controller')("PlayerGameStatsDetailController", locals);
            };
        }));


        describe('Root Scope Listening', function() {
            it('Unregisters root scope listener upon scope destruction', function() {
                var eventType = 'hippoApp:playerGameStatsUpdate';

                createController();
                expect($rootScope.$$listenerCount[eventType]).toEqual(1);

                $scope.$destroy();
                expect($rootScope.$$listenerCount[eventType]).toBeUndefined();
            });
        });
    });

});
