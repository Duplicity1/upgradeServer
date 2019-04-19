/**
 * Created by 7 on 2017/7/18.
 */
define(['app'],function(app) {
    app.service('loginService', function ($http) {
        console.log("login Service init...");
        //提供外部可调用的函数
        return {
            downloadInfo:function(productType,cb){
                console.log("请求下载信息！");
                var obj={
                    productType:productType
                }
                $http({
                    method : 'POST',
                    url : "/fxrest/getDownloadInfo",
                    data : obj,
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                }).success(function(res) {
                    cb(res);
                }).error(function(e){

                });
            },
            getProductTypeInfo:function(cb){
                console.log("请求下载信息！");
                $http({
                    method : 'POST',
                    url : "/fxrest/getProductTypeInfo",
                    data : "",
                    headers : {
                        'Content-Type' : 'application/json'
                    }
                }).success(function(res) {
                    cb(res);
                }).error(function(e){
                    console.log("数据请求失败！")
                });
            },
            getFilePathAndLoad:function(selectProductTypeInfo,selectPackageName,cb){
                console.log("请求下载信息！");
                var obj="/"+selectProductTypeInfo+"/"+selectPackageName;
                console.log("obj"+JSON.stringify(obj));
                $http({
                    method : 'get',
                    url : "/fxrest/getFilePathAndLoad"+obj,
                    headers : {
                        'Content-Type' : 'application/json',
            }
                }).success(function(res) {
                    
                    cb(res);
                }).error(function(e){
                    console.log("数据请求失败！"+e)
                });
            },
            trueOrfalse:function(domId){
                return document.getElementById(domId).checked;
            },
        }
    });
});