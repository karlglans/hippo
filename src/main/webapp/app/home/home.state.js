(function() {
    'use strict';

    angular
        .module('hippoApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('home', {
            parent: 'app',
            url: '/',
            data: {
                authorities: []
            },
            views: {
                'content@': {
                    templateUrl: 'app/home/home.html',
                    controller: 'HomeController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                gameList: ['GameRepo',
                    function (GameRepo) {
                        return GameRepo.downloadStats();
                    }
                ]
            }
        });
    }
})();
