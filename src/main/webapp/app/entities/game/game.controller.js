(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameController', GameController);

    GameController.$inject = ['$scope', '$state', 'Game'];

    function GameController ($scope, $state, Game) {
        var vm = this;

        vm.games = [];

        loadAll();

        function loadAll() {
            Game.query(function(result) {
                vm.games = result;
            });
        }
    }
})();
