(function() {
    'use strict';

    angular
        .module('hippoApp', [
            'ngStorage',
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngSanitize', // added
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router',
            'infinite-scroll',
            // jhipster-needle-angularjs-add-module JHipster will add new module here
            'angular-loading-bar'
        ])
        .run(run);

    run.$inject = ['stateHandler'];

    function run(stateHandler) {
        stateHandler.initialize();
    }
})();
