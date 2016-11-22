(function() {
    'use strict';
    angular
        .module('hippoApp')
        .factory('PlayerGameStats', PlayerGameStats);

    PlayerGameStats.$inject = ['$resource'];

    function PlayerGameStats ($resource) {
        var resourceUrl =  'api/player-game-stats/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);
                    }
                    return data;
                }
            },
            'update': { method:'PUT' }
        });
    }
})();
