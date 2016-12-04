(function() {
    'use strict';

    angular
        .module('hippoApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('portal', {
            parent: 'app',
            url: '/portal',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    templateUrl: 'app/games/game.html',
                    controller: 'GameController',
                    controllerAs: 'vm'
                }
            }
        });
    }
})();