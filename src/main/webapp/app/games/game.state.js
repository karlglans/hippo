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
                gameData: ['$stateParams', 'GameInfo', function($stateParams, GameInfo) {
                    return GameInfo.get({id : $stateParams.id}).$promise;// promise;
                }]
            }
        });
    }
})();