(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('PlayerGameStatsDetailController', PlayerGameStatsDetailController);

    PlayerGameStatsDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'PlayerGameStats', 'User', 'Game'];

    function PlayerGameStatsDetailController($scope, $rootScope, $stateParams, previousState, entity, PlayerGameStats, User, Game) {
        var vm = this;

        vm.playerGameStats = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('hippoApp:playerGameStatsUpdate', function(event, result) {
            vm.playerGameStats = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
