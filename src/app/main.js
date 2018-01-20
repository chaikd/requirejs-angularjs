require.config({
    baseUrl: 'app',
    paths: {
        'app': 'app',
        'angular': '../bower_components/angular/angular.min',
        'router': '../bower_components/angular-ui-router/release/angular-ui-router.min'
    },
    shim: {
        'angular': {
            exports: 'angular'
        },
        // 'app': {
        // 	exports: 'app'
        // },
        'router': {
            deps: ['angular']
        },
        'app': {
            deps: ['router']
        }
    }
})
// 初始化myModule模块
require(['app'], function() {
    angular.bootstrap(document, ['app'])
})