(function() {
    'use strict';
    angular
        .module('hippoApp')
        .factory('GameInfo', GameInfo);

    GameInfo.$inject = ['$resource', '$q'];

    function GameInfo ($resource, $q) {
       var resourceUrl =  '/api/v1/game/stats/:id'; 
       return $resource(resourceUrl, {}, {
           'get': {
               method: 'GET',
               transformResponse: function (data) {
                   if (data) {
                       data = angular.fromJson(data);
                   }
                   return data;
               }
           }
       });
    }
})();