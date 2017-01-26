(function() {
    'use strict';

    angular
        .module('hippoApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('portal', {
            parent: 'app',
            url: '/portal/{id}',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    templateUrl: 'app/games/game.html',
                    controller: 'GameHostController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                gameData: ['$stateParams', 'GameRepo', function($stateParams, GameRepo) {
                    return GameRepo.getGameInfo($stateParams.id);
                }]
                // gameData: ['$stateParams', 'GameService', function($stateParams, GameService) {
                //     return GameService.getGameInfo($stateParams.id);
                // }]
            }
        });
    }
})();