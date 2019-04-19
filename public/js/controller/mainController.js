/**
 * Created by zm on 2017/7/11.
 */

define(['app', 'i18n_zh', 'i18n_en', 'service/mainService', 'ng_file_upload', 'ng_file_upload_shim', 'service/utilService'], function (app, i18n_zh, i18n_en) {
    app.controller('mainController', function ($scope, $state, $translate, mainService, Upload, utilService) {

        //判断当前浏览器语言类型
        var lang = utilService.getSystemLanguage();
        $translate.use(lang);
        var language;
        if (lang == "zh" || lang == "zh-cn") {
            language = i18n_zh;
        } else if (lang == "en" || lang == "en-us") {
            language = i18n_en;
        } else {
            language = i18n_zh;
        }
        //上传文件
        $scope.productType = "";
        $scope.productTypes = [];
        $scope.fileDesc = "";
        $scope.versionDesc = "";
        $scope.uploadFile = "";
        $scope.versionCode = "";
        //$scope.md5 = "";
        $scope.productDevice = "";
        var uploadFlag = "";
        var productionAllDta = [];
        getProductionTypes();
        function getProductionTypes() {
            mainService.getProductionTypes(function (data) {
                productionAllDta = data;
                for (var i in data) {
                    $scope.productTypes.push(data[i].typeName);
                }
                $scope.productType = data[0].typeName;
                $scope.productTypeSelect = data[0].typeName;
                console.log("$scope.productTypes:" + JSON.stringify(productionAllDta));
            })
        };


        $scope.uploadFileSelect = function () {
            if ($scope.uploadFile) {
                $scope.uploadFilePath = $scope.uploadFile.name;
            } else {
                $scope.uploadFilePath = "";
            }
            console.log("$scope.uploadFilePath:" + $scope.uploadFilePath);

        };
        $scope.UpgradePackageUpload = function () {

            var productionType;
            for (var i in productionAllDta) {
                console.log(productionAllDta[i].typeName);
                console.log($scope.productType);
                if (productionAllDta[i].typeName == $scope.productType) {
                    productionType = productionAllDta[i].typeCode;
                    console.log(productionType);
                    break;
                }
            }
            if ($scope.uploadFile) {
                console.log($scope.uploadFile.name);
                var fileName = $scope.uploadFile.name;
                var nameArr = fileName.split('.');
                // if(nameArr[nameArr.length-1]=='gz'){
                if (fileName.length == 0 || fileName.length > 128) {
                    alert(language.fileNameLength);
                    return;
                }
                if ($scope.uploadFile.size == 0) {
                    alert(language.fileSize);
                    return;
                }
            } else {
                alert(language.selectFile);
                return;
            }
            if ($scope.productType.indexOf("IPVT-ROM")>-1) {

                if ($scope.productDevice == "") {
                    alert(language.productDeviceNull)
                    return;
                }
                if ($scope.productDevice.length > 64) {
                    alert(language.productDeviceLength)
                    return;
                }
                if ($scope.versionCode == "") {
                    alert(language.versionCodeNull)
                    return;
                }
                if(!isVersionCode($scope.versionCode)){
                    alert(language.versionCodeIllegal)
                    return;
                }
                if ($scope.versionCode.length > 64) {
                    alert(language.versionCodeLength)
                    return;
                }
                //if ($scope.md5 == "") {
                //    alert(language.md5Null)
                //    return;
                //}
                //if ($scope.md5.length > 64) {
                //    alert(language.md5Length)
                //    return;
                //}
            }

            if ($scope.fileDesc == "") {
                alert(language.fileDescIsNull);
                return;
            }
            if ($scope.fileDesc.length > 64) {
                alert(language.fileDescLength);
                return;
            }
            if ($scope.versionDesc == "") {
                alert(language.versionDescIsNull);
                return;
            }
            if ($scope.versionDesc.length > 64) {
                alert(language.versionDescLength);
                return;
            }

            $scope.upload(productionType, $scope.fileDesc, $scope.versionDesc, fileName, $scope.versionCode,  $scope.productDevice, $scope.uploadFile);


        };

        function isVersionCode(versionCode){
            var re = /^.+\.M\d{2}\.\d{6}\.\D\d{3,}$/;
            if(re.test(versionCode)){
                console.log("versionCode true")
                return true
            }else{
                console.log("versionCode false")
                return false
            }
        }
        function clear() {
            $scope.fileDesc = " ";
            $scope.versionDesc = " ";
            $scope.uploadFile = "";
            uploadFlag = "";
            $scope.productDevice = "";
            $scope.versionCode = "";
            //$scope.md5 = "";
            document.getElementById("uploadFilePath").value = " ";
        }

        $scope.upload = function (productType, fileDesc, versionDesc, upFileValue, versionCode, productDevice, file) {
            console.log("----------uploadFlag---------" + uploadFlag);
            if (uploadFlag == "" || uploadFlag == "uploadSuccess") {
                var obj = productType + ":" + fileDesc + ":" + versionDesc + ":" + upFileValue + ":" + versionCode + ":" + productDevice;
                $('#progress').show();
                var schedule = 0;
                var up = Upload.upload({
                    //服务端接收
                    url: '/fxrest/UpgradePackageUpload' + obj,
                    //上传的文件
                    method: 'POST',
                    file: file
                }).progress(function (evt) {
                    //进度条
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    // console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
                    schedule = progressPercentage;
                    $('#bar').css('width', schedule + '%');
                    $('#bar')[0].innerHTML = schedule + '%';
                    console.log("================uploadFlag==========" + schedule);
                    uploadFlag = "uploading";
                    if (schedule == 99) {
                        $('#bar').css('width', '100%');
                        $('#bar')[0].innerHTML = '100%';

                        uploadFlag = "uploadSuccess";
                    } else if (schedule == 100) {
                        $('#bar').css('width', '100%');
                        $('#bar')[0].innerHTML = '100%';

                        uploadFlag = "uploadSuccess";
                    }
                }).success(function (data, status, headers, config) {
                    //上传成功
                    $('#progress').hide();
                    console.log('file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data));
                    if (data.result == "0") {
                        alert(language.uploadFail);
                    } else if (data.result == "1") {
                        alert(language.uploadSuccess);
                        console.log("uploadFlag1:" + uploadFlag);
                        clear();
                        console.log("uploadFlag2:" + uploadFlag);
                        createTable('/fxrest/packages');
                    } else if (data.result == "3") {
                        alert(language.fileNameExits);
                    }
                }).error(function (data, status, headers, config) {
                    //上传失败
                    // console.log('error status: ' + status);
                    alert(language.uploadFail);
                });
                $scope.cancelFile = up.abort;
            } else if (uploadFlag == "uploading") {
                alert(language.fileIsUploading);
            }

        };
        /************************************升级包信息呈现表格***********************************************/
            //定义表格行操作事件
        window.operateEvents = {
            'click .del': function (e, value, row, index) {
                if (confirm(language.deleteConfirm)) {
                    deletePackageInfo(row.productType, row.versionNum);
                }

            }
        };
        //创建表格
        createTable('/fxrest/packages');
        function createTable(url) {
            var $table = $('#table');
            $table.bootstrapTable('destroy');
            $table.bootstrapTable({
                url: url,
                queryParams: function (params) {//请求服务器时所传的参数
                    return {
                        pageSize: params.limit, //每一页的数据行数，默认是上面设置的10(pageSize)
                        pageIndex: params.offset + 1, //当前页面,默认是上面设置的1(pageNumber)
                    }
                },
                pageNumber: 1,
                cache: false,
                pageSize: 5,
                pageList: [2, 5, 10, 15, 20, 25],//分页步进值
                pagination: true,
                sidePagination: 'server',//指定服务器端分页
                locale: language.tableLanguage,//en-US英文，zh-CN中文
                columns: [
                    {
                        title: language.productType,
                        field: 'productType',
                        align: 'center',
                    },
                    {
                        title: language.versionNum,
                        field: 'versionNum',
                        align: 'center',
                    },
                    {
                        title: language.packageSize,
                        field: 'packageSize',
                        align: 'center'
                    },
                    {
                        title: language.packageName,
                        field: 'packageName',
                        align: 'center'
                    },
                    {
                        title: language.uploadPath,
                        field: 'uploadPath',
                        align: 'center'
                    },
                    {
                        title: language.uploadTime,
                        field: 'uploadTime',
                        align: 'center'
                    },
                    {
                        title: language.downloadTimes,
                        field: 'downloadTimes',
                        align: 'center'
                    },
                    {
                        title: language.fileDesc,
                        field: 'packageDesc',
                        align: 'center'
                    },
                    {
                        title: language.versionDesc,
                        field: 'versionDesc',
                        align: 'center'
                    },
                    {
                        title: language.operation,
                        field: 'operate',
                        align: 'center',
                        formatter: operateFormatter,
                        events: operateEvents
                    }
                ],
            });

        }

        function operateFormatter(val, row, index) {
            if (lang == "zh" || lang == "zh-cn") {
                return '<input type="button" class="del" value="删除" /> ';
            } else {
                return '<input type="button" class="del" value=delete /> ';
            }

        };

        //删除行数据后，重建表格
        function deletePackageInfo(productType, versionNum) {
            var productionType;
            for (var i in productionAllDta) {
                if (productionAllDta[i].typeName == productType) {
                    productionType = productionAllDta[i].typeCode;
                    break;
                }
            }
            createTable("/fxrest/packages/" + productionType + "/" + versionNum);
        };
        //按产品类型查询，并在表格中显示
        $scope.productTypeSelect = "";
        $scope.search = function () {
            var productionType;
            for (var i in productionAllDta) {
                if (productionAllDta[i].typeName == $scope.productTypeSelect) {
                    productionType = productionAllDta[i].typeCode;
                    break;
                }
            }
            createTable("/fxrest/packages/" + productionType);
        };

        //动态设置表格所在div高度
        var hh = document.body.clientHeight;
        var packageInfoHeight = hh * 0.9 - 180;
        var packageInfoTableHeight = packageInfoHeight - 40;
        $("#package_info").height(packageInfoHeight);
        $("#package_info_table").height(packageInfoTableHeight);
        window.onresize = function () {
            var hh = document.body.clientHeight;
            var packageInfoHeight = hh * 0.9 - 180;
            var packageInfoTableHeight = packageInfoHeight - 40;
            $("#package_info").height(packageInfoHeight);
            $("#package_info_table").height(packageInfoTableHeight);
        }

        $scope.productTypeChange = function () {
            if ($scope.productType.indexOf("IPVT-ROM")>-1) {
                $("#romInput").show()
                //$("#productDevice1").show()
                //$("#productDevice2").show()
            } else {
                $("#romInput").hide()
                //$("#productDevice1").hide()
                //$("#productDevice2").hide()
            }
        }


        //退出
        $scope.exit = function () {
            if (confirm(language.exit)) {
                $state.go('login');
            }
        }
    })


});