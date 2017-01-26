(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http', 'gameList', 'GameRepo'];

    function HomeController ($scope, Principal, LoginService, $state, $http, gameList, GameRepo) {
        var vm = this;

        console.log("gameList", gameList);

        vm.gameList = gameList;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        vm.launch = launch;
//        vm.registerGame = registerGame;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

        function launch(titleShort) {
            //console.log("launch ", titleShort);
            //var game = GameRepo.findGameById(gameID);
            //var titleShort = game.titleShort;
            console.log("start game: ", titleShort);
            $state.go('portal', {id: titleShort});
        }
        
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
