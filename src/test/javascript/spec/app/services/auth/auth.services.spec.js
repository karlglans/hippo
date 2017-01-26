'use strict';

describe('Service Tests', function () {
    beforeEach(mockApiCall);
    beforeEach(mockApiAccountCall);
    beforeEach(mockScriptsCalls);

    describe('Auth', function () {
        var $httpBackend, localStorageService, sessionStorageService, authService, spiedAuthServerProvider;

        var $q, GameRepo, gameRepo;


        beforeEach(inject(function($injector, $localStorage, $sessionStorage, Auth, AuthServerProvider, GameRepo) {
            $httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
            localStorageService = $localStorage;
            sessionStorageService = $sessionStorage;
            authService = Auth;
            spiedAuthServerProvider = AuthServerProvider;
            gameRepo = GameRepo;
        }));
        //make sure no expectations were missed in your tests.
        //(e.g. expectGET or expectPOST)
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
        it('should call backend on logout then call authServerProvider.logout', function(){
            //GIVEN
            //Set spy
            spyOn(spiedAuthServerProvider, 'logout').and.callThrough();

            spyOn(gameRepo, 'downloadStats').and.returnValue($q.resolve([]));

            //WHEN
            authService.logout();
            //flush the backend to "execute" the request to do the expectedGET assertion.
            $httpBackend.flush();

            //THEN
            expect(spiedAuthServerProvider.logout).toHaveBeenCalled();
            expect(localStorageService.authenticationToken).toBe(undefined);
            expect(sessionStorageService.authenticationToken).toBe(undefined);

            expect(gameRepo.downloadStats).toHaveBeenCalled();
        });
    });
});
