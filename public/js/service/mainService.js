/**
 * Created by zm on 2017/7/12.
 */
define(['app'],function(app){
    app.service('mainService',function($http){
        return{
            getPackageInfos:function(cb){
                $http.get('/packages')
                    .success(function(data){
                        cb(data);
                    })
                    .error(function(e){
                        console.log("获得所有升级包信息失败！11"+e);
                    })
            },
            UpgradePackageUpload:function(productType,fileDesc,versionDesc,upFileValue,cb){
                console.log("请求升级！");
                var obj=productType+":"+fileDesc+":"+versionDesc+":"+upFileValue;
                console.log("obj:"+obj);
                var formData = new FormData();
                formData.append('file', document.querySelector('input[type=file]').files[0]);
                console.log("formData:"+JSON.stringify(formData));
                $.ajax({
                    url:'/fxrest/UpgradePackageUpload'+obj,
                    type: 'POST',
                    data: formData,
                    async: false,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (data) {
                        if(data.result=="0"){
                            alert("上传失败！");
                            cb('error');
                        }
                        if(data.result=="1")
                        {
                            alert("上传成功！");
                            cb('ok');
                        }
                        if(data.result=="3"){
                            alert("文件名已经存在！");
                            cb('error');
                        }
                        console.log("上传成功!!"+JSON.stringify(data));
                    },
                    error: function (e) {
                        alert("上传失败！");
                        console.log("上传出错"+JSON.stringify(e));
                        cb('error');
                    }
                })

            },
            getAllProductTypes:function(cb){
                $http.get('/fxrest/productTypes')
                    .success(function(data){
                        console.log("------------------------字典表信息："+JSON.stringify(data));
                        cb(data);
                    })
                    .error(function(e){

                    })
            },
            getProductionTypes:function(cb){
                $http.get('/fxrest/getProductionTypes')
                    .success(function(data){
                        console.log("getProductionTypes:"+JSON.stringify(data));
                        cb(data);
                    })
                    .error(function(e){
                        console.log("获得所有升级包信息失败！111"+e);
                    })
            }
        }

    });
});