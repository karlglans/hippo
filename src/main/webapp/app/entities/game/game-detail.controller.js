(function() {
    'use strict';

    angular
        .module('hippoApp')
        .controller('GameDetailController', GameDetailController);

    GameDetailController.$inject = ['$scope', '$rootScope', '$stateParams', 'previousState', 'entity', 'Game'];

    function GameDetailController($scope, $rootScope, $stateParams, previousState, entity, Game) {
        var vm = this;

        vm.game = entity;
        vm.previousState = previousState.name;

        var unsubscribe = $rootScope.$on('hippoApp:gameUpdate', function(event, result) {
            vm.game = result;
        });
        $scope.$on('$destroy', unsubscribe);
    }
})();
