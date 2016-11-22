(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('PlayerGameStatsDeleteController',PlayerGameStatsDeleteController);

    PlayerGameStatsDeleteController.$inject = ['$uibModalInstance', 'entity', 'PlayerGameStats'];

    function PlayerGameStatsDeleteController($uibModalInstance, entity, PlayerGameStats) {
        var vm = this;

        vm.playerGameStats = entity;
        vm.clear = clear;
        vm.confirmDelete = confirmDelete;

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function confirmDelete (id) {
            PlayerGameStats.delete({id: id},
                function () {
                    $uibModalInstance.close(true);
                });
        }
    }
})();
