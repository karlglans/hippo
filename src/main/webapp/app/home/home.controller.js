(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('HomeController', HomeController);

    HomeController.$inject = ['$scope', 'Principal', 'LoginService', '$state', '$http'];

    function HomeController ($scope, Principal, LoginService, $state, $http) {
        var vm = this;

        vm.account = null;
        vm.isAuthenticated = null;
        vm.login = LoginService.open;
        vm.register = register;
        vm.addPlayerStats = addPlayerStats;
        $scope.$on('authenticationSuccess', function() {
            getAccount();
        });

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
        function addPlayerStats () {
        	
        	$http.post("/api/v1/game/start/1/")
        		.success(function(){
        			console.log("succsess()");
        		});
        	
        	console.log("api/v1/game/start");
        }
    }
})();
