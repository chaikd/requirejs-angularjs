define([], function() {
    var app = angular.module('app', ['ui.router']);
    app.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.register = {
            //得到$controllerProvider的引用
            controller: $controllerProvider.register,
            //同样的，这里也可以保存directive／filter／service的引用
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            service: $provide.service
        };
    })
    app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('list');
        $stateProvider
            .state("list", {
                url: "/list",
                controller: 'listCtrl',
                templateUrl: 'app/list/list.html',
                resolve: {
                    loadCtrl: ["$q", function($q) {
                        var deferred = $q.defer();
                        //异步加载controller／directive/filter/service
                        require([
                            'list/list.controller'
                        ], function() { deferred.resolve(); });
                        return deferred.promise;
                    }]
                }
            })
            .state("show", {
                url: "/show",
                controller: 'showCtrl',
                templateUrl: 'app/show/show.html',
                resolve: {
                    loadCtrl: ["$q", function($q) {
                        var deferred = $q.defer();
                        //异步加载controller／directive/filter/service
                        require([
                            'show/show.controller'
                        ], function() { deferred.resolve(); });
                        return deferred.promise;
                    }]
                }
            })
    }])
    return app;
})