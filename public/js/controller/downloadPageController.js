/**
 * Created by 7 on 2017/7/20.
 */
define(['app', 'i18n_zh', 'i18n_en','service/loginService','service/mainService', 'service/utilService'],function(app, i18n_zh, i18n_en){
    app.controller('downloadPageController',function($scope,$compile,$state,$translate,loginService,mainService, utilService){
        console.log('login controller init...');
        
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
        
        $scope.ProductionTypes=[];
        var productionAllDta;
        getProductionTypes();
        function getProductionTypes(){
            mainService.getProductionTypes(function (data) {
                productionAllDta = data;
                console.log("$scope.selectProductTypeInfo:" + JSON.stringify(productionAllDta));
                for (var i in productionAllDta) {
                    $scope.ProductionTypes.push(data[i].typeName);
                }
                $scope.selectProductType = data[0].typeName;
                createTable("/fxrest/packages/" + $scope.selectProductType);
            })
        };

        //获取所有产品类型的数据
        $scope.getProductPackagesInfo = function() {
            //查询出当前产品类型的所有升级包
            search();
        };
        
        /************************************下载升级包***********************************************/
        
        function downloadPackage(productType,packageName) {
            var url = "http://" + window.location.host + "/fxrest/downloadPackage/"+productType+"/" + packageName;
            console.log("url:" + url);
            window.location.href = url;
        }
        
        /************************************升级包信息呈现表格***********************************************/

        // 点击事件
        window.operateEvents = {
            'click .download': function (e, value, row, index) {
                console.log("row.productType:"+row.productType+"===row.versionNum:"+row.versionNum);
                //调用下载的方法
                downloadPackage(row.productType,row.packageName);
            }
        };
        
        //创建表格
        function createTable(url) {
            var $version_table = $('#version_table');
            $version_table.bootstrapTable('destroy');
            $version_table.bootstrapTable({
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
                return '<input type="button" class="download" value="下载" /> ';
            } else {
                return '<input type="button" class="download" value=download /> ';
            }
            console.log("row.productType:"+row.productType+"===row.versionNum"+row.versionNum);
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
    
        function  search () {
            for (var i in productionAllDta) {
                var productionType;
                if (productionAllDta[i].typeName == $scope.selectProductType) {
                    productionType = productionAllDta[i].typeCode;
                    break;
                }
            }
            createTable("/fxrest/packages/" + productionType);
        };
    });
});