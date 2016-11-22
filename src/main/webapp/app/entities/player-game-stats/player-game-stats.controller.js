(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('PlayerGameStatsController', PlayerGameStatsController);

    PlayerGameStatsController.$inject = ['$scope', '$state', 'PlayerGameStats'];

    function PlayerGameStatsController ($scope, $state, PlayerGameStats) {
        var vm = this;

        vm.playerGameStats = [];

        loadAll();

        function loadAll() {
            PlayerGameStats.query(function(result) {
                vm.playerGameStats = result;
            });
        }
    }
})();
