/**
 * Created by zm on 2017/5/24.
 */

define(['angular','routerConfig','routerLoader','angularAMD','i18n_en','i18n_zh','bootstrap-table','translate','router','bootstrap','bootstrap-table-locale-all'],

    function(angular,routerConfig,routerLoader,angularAMD,i18n_en,i18n_zh){

        var app=angular.module('myApp',['pascalprecht.translate','ui.router']);
        /**
         * 配置路由
         */
        app.config(function($stateProvider, $urlRouterProvider) {
            if (routerConfig.routes != undefined) {
                angular.forEach(routerConfig.routes, function(route, path) {
                    $stateProvider.state(path, {
                        templateUrl : route.templateUrl,
                        url : route.url,
                        resolve : routerLoader(route.dependencies)
                    });
                });
            }
            // 默认路由
            if (routerConfig.defaultRoute != undefined) {
                $urlRouterProvider.when("", routerConfig.defaultRoute);
            }
        })
        /**
         * 配置国际化
         */
        app.config(function ($translateProvider) {
            $translateProvider.translations('en',i18n_en);
            $translateProvider.translations('zh',i18n_zh);
            //默认语言
            $translateProvider.preferredLanguage('zh');
            $translateProvider.useSanitizeValueStrategy('escaped');
        });
        /**
         * 运行程序初始化状态
         */
        app.run(function ($rootScope) {

        });
        //手动启动angular
        return angularAMD.bootstrap(app);
});