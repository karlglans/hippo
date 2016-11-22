(function() {
    'use strict';

    angular
        .module('hippoApp')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider
        .state('player-game-stats', {
            parent: 'entity',
            url: '/player-game-stats',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'PlayerGameStats'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/player-game-stats/player-game-stats.html',
                    controller: 'PlayerGameStatsController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
            }
        })
        .state('player-game-stats-detail', {
            parent: 'entity',
            url: '/player-game-stats/{id}',
            data: {
                authorities: ['ROLE_USER'],
                pageTitle: 'PlayerGameStats'
            },
            views: {
                'content@': {
                    templateUrl: 'app/entities/player-game-stats/player-game-stats-detail.html',
                    controller: 'PlayerGameStatsDetailController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                entity: ['$stateParams', 'PlayerGameStats', function($stateParams, PlayerGameStats) {
                    return PlayerGameStats.get({id : $stateParams.id}).$promise;
                }],
                previousState: ["$state", function ($state) {
                    var currentStateData = {
                        name: $state.current.name || 'player-game-stats',
                        params: $state.params,
                        url: $state.href($state.current.name, $state.params)
                    };
                    return currentStateData;
                }]
            }
        })
        .state('player-game-stats-detail.edit', {
            parent: 'player-game-stats-detail',
            url: '/detail/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/player-game-stats/player-game-stats-dialog.html',
                    controller: 'PlayerGameStatsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['PlayerGameStats', function(PlayerGameStats) {
                            return PlayerGameStats.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('^', {}, { reload: false });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('player-game-stats.new', {
            parent: 'player-game-stats',
            url: '/new',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/player-game-stats/player-game-stats-dialog.html',
                    controller: 'PlayerGameStatsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: function () {
                            return {
                                nGamesPlayed: null,
                                score: null,
                                rating: null,
                                startLevel: null,
                                id: null
                            };
                        }
                    }
                }).result.then(function() {
                    $state.go('player-game-stats', null, { reload: 'player-game-stats' });
                }, function() {
                    $state.go('player-game-stats');
                });
            }]
        })
        .state('player-game-stats.edit', {
            parent: 'player-game-stats',
            url: '/{id}/edit',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/player-game-stats/player-game-stats-dialog.html',
                    controller: 'PlayerGameStatsDialogController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        entity: ['PlayerGameStats', function(PlayerGameStats) {
                            return PlayerGameStats.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('player-game-stats', null, { reload: 'player-game-stats' });
                }, function() {
                    $state.go('^');
                });
            }]
        })
        .state('player-game-stats.delete', {
            parent: 'player-game-stats',
            url: '/{id}/delete',
            data: {
                authorities: ['ROLE_USER']
            },
            onEnter: ['$stateParams', '$state', '$uibModal', function($stateParams, $state, $uibModal) {
                $uibModal.open({
                    templateUrl: 'app/entities/player-game-stats/player-game-stats-delete-dialog.html',
                    controller: 'PlayerGameStatsDeleteController',
                    controllerAs: 'vm',
                    size: 'md',
                    resolve: {
                        entity: ['PlayerGameStats', function(PlayerGameStats) {
                            return PlayerGameStats.get({id : $stateParams.id}).$promise;
                        }]
                    }
                }).result.then(function() {
                    $state.go('player-game-stats', null, { reload: 'player-game-stats' });
                }, function() {
                    $state.go('^');
                });
            }]
        });
    }

})();
