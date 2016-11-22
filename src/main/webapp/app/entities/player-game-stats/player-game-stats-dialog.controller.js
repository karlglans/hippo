(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('PlayerGameStatsDialogController', PlayerGameStatsDialogController);

    PlayerGameStatsDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'PlayerGameStats', 'User', 'Game'];

    function PlayerGameStatsDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, PlayerGameStats, User, Game) {
        var vm = this;

        vm.playerGameStats = entity;
        vm.clear = clear;
        vm.save = save;
        vm.users = User.query();
        vm.games = Game.query();

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.playerGameStats.id !== null) {
                PlayerGameStats.update(vm.playerGameStats, onSaveSuccess, onSaveError);
            } else {
                PlayerGameStats.save(vm.playerGameStats, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('hippoApp:playerGameStatsUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
