(function() {
    'use strict';

    angular
        .module('hippoApp')
        .factory('notificationInterceptor', notificationInterceptor);

    notificationInterceptor.$inject = ['$q', 'AlertService'];

    function notificationInterceptor ($q, AlertService) {
        var service = {
            response: response
        };

        return service;

        function response (response) {
            var alertKey = response.headers('X-hippoApp-alert');
            if (angular.isString(alertKey)) {
                AlertService.success(alertKey, { param : response.headers('X-hippoApp-params')});
            }
            return response;
        }
    }
})();
