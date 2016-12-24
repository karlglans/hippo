(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', 'gameList'];

    function HomeController ($scope, Principal, LoginService, $state, $http, gameList) {
        var vm = this;

        console.log(gameList);

        vm.gameList = gameList;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
//        vm.registerGame = registerGame;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });
        
        var gameKey, gameId = 1, isStarted = false;

        getAccount();

        function getAccount() {
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }
        function register () {
            $state.go('register');
        } 
        
    }
})();
