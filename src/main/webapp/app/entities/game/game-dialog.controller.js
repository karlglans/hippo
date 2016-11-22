(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameDialogController', GameDialogController);

    GameDialogController.$inject = ['$timeout', '$scope', '$stateParams', '$uibModalInstance', 'entity', 'Game'];

    function GameDialogController ($timeout, $scope, $stateParams, $uibModalInstance, entity, Game) {
        var vm = this;

        vm.game = entity;
        vm.clear = clear;
        vm.save = save;

        $timeout(function (){
            angular.element('.form-group:eq(1)>input').focus();
        });

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            vm.isSaving = true;
            if (vm.game.id !== null) {
                Game.update(vm.game, onSaveSuccess, onSaveError);
            } else {
                Game.save(vm.game, onSaveSuccess, onSaveError);
            }
        }

        function onSaveSuccess (result) {
            $scope.$emit('hippoApp:gameUpdate', result);
            $uibModalInstance.close(result);
            vm.isSaving = false;
        }

        function onSaveError () {
            vm.isSaving = false;
        }


    }
})();
