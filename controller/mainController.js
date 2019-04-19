/**
 * Created by zm on 2017/7/12.
 */
var express = require('express');
var router = express.Router();
var mainService = require('../service/mainService');
var logger = require('log')("all");
var fs = require('fs');
var mime = require('mime');

router.get('/packages', function (req, res) {
    var pageSize = req.query.pageSize;
    var pageIndex = req.query.pageIndex;
    logger.info("请求获取所有升级包信息：pageSize:" + pageSize + ",pageIndex:" + pageIndex);
    mainService.getAllPackageInfosForPage(pageSize, pageIndex, res);
});
router.get('/getProductionTypes', function (req, res) {
    logger.info("请求获取所有产品类型信息");
    mainService.getProductionTypes(res);
});

router.get('/packages/:productType', function (req, res) {
    var productType = req.params.productType;
    var pageSize = req.query.pageSize;
    var pageIndex = req.query.pageIndex;
    logger.info("请求按产品类型查询升级包信息,productType:" + productType + ",pageSize:" + pageSize + ",pageIndex:" + pageIndex);
    mainService.getPackageInfosByProductType(productType, pageSize, pageIndex, res);
});

router.get('/packages/:productType/:versionNum', function (req, res) {
    var productType = req.params.productType;
    var versionNum = req.params.versionNum;
    var pageSize = req.query.pageSize;
    var pageIndex = req.query.pageIndex;
    logger.info("请求按条件删除升级包信息,productType:" + productType + ",versionNum：" + versionNum + ",pageSize:" + pageSize + ",pageIndex:" + pageIndex);

    mainService.deletePackageInfo(productType, versionNum, pageSize, pageIndex, res);
});

router.post('/UpgradePackageUpload:obj', function (req, res) {
    logger.info("mainController 请求升级");
    var param = req.params.obj;
    logger.info("param>>>>>" + param);
    var productType = param.split(":")[0];
    var fileDesc = param.split(":")[1];
    var versionDesc = param.split(":")[2];
    var upFileValue = param.split(":")[3];
    var versionCode = param.split(":")[4];
    //var md5 = param.split(":")[5];
    var productDevice = param.split(":")[5];
    mainService.UpgradePackageUpload(productType, fileDesc, versionDesc, upFileValue, versionCode, productDevice, req, res);
});

router.get('/productTypes', function (req, res) {
    logger.info("请求获取所有产品类型字典表信息");
    mainService.getProductTypes(res);
});


//提供给客户端使用的接口
router.get('/:productType/packages', function (req, res) {
    var productType = req.params.productType;
    logger.info("客户端请求按产品类型查询升级包信息,productType:" + productType);
    mainService.getPackageInfosByProductType(productType, null, null, res);
});
router.get('/:productType/:versionNum/package', function (req, res) {
    var productType = req.params.productType;
    var versionNum = req.params.versionNum;
    logger.info("客户端请求按产品类型和版本号下载升级包,productType:" + productType + ",versionNum:" + versionNum);
    mainService.downloadByProductTypeAndVersionNum(productType, versionNum, res);
});
router.get('/productTypes', function (req, res) {
    logger.info("客户端请求获取所有产品类型字典信息");
    mainService.getProductTypes(res);
});

router.get('/download/:packageName',function (req,res) {{
    var packageName = req.params.packageName;
    logger.info("客户端根据产品名称下载升级包,下载次数增加一次，packageName:"+packageName);
    mainService.downloadByPackageName(packageName,res);
}

})

module.exports = router;