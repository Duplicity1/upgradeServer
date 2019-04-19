/**
 * Created by zm on 2017/5/24.
 */
require.config({
    baseUrl:'js',
    paths:{
        'jquery':'../bower_components/jquery/dist/jquery.min',
        'angular':'../bower_components/angular/angular',
        'translate':'../bower_components/angular-translate/angular-translate',
        'router':'../bower_components/angular-ui-router/release/angular-ui-router',
        'angularAMD':'../bower_components/angularAMD/angularAMD',
        'bootstrap':'../bower_components/bootstrap/dist/js/bootstrap',
        'routerConfig':'router/routes',
        'routerLoader':'router/loader',
        'i18n_en':'i18n/i18n_en',
        'i18n_zh':'i18n/i18n_zh',
        'bootstrap-table':'../bower_components/bootstrap-table/dist/bootstrap-table.min',
        'bootstrap-table-locale-all':'../bower_components/bootstrap-table/dist/bootstrap-table-locale-all.min',
        'ng_file_upload':'/bower_components/ng-file-upload/ng-file-upload.min',
        'ng_file_upload_shim':'/bower_components/ng-file-upload-shim/ng-file-upload-shim.min'
    },
    shim:{
        'angular':{
            deps:['jquery'],
            exports:'angular'
        },
        'translate':{
            deps:['angular']
        },
        'router':{
            deps:['angular']
        },
        'angularAMD':{
            deps:['angular']
        },
        'bootstrap':{
            deps:['jquery']
        },
        'bootstrap-table':{
            deps:['jquery','bootstrap']
        },
        'bootstrap-table-locale-all':{
            deps:['jquery','bootstrap','bootstrap-table']
        }

    },
    //防止读取缓存，调试用
    urlArgs: "bust=" + (new Date()).getTime() ,
    //启动程序 js/app.js
    deps:['app']

});