/**
 * Created by 7 on 2017/7/18.
 */
var express=require('express');
var router=express.Router();
var loginService=require('../service/loginService');
var logger=require('log')("all");
router.post('/getDownloadInfo',function (req,res) {
    logger.info("loginController 请求下载信息");
    var param = req.body.productType;
    console.log("param:"+param);
    loginService.getDownloadInfo(param,req,res);
});
router.post('/getProductTypeInfo',function (req,res) {
    logger.info("loginController 请求产品类别信息");
    loginService.getProductTypeInfo(req,res);
});
router.get('/getFilePathAndLoad/:productType/:packageName',function (req,res) {

    var selectProductTypeInfo = req.params.productType;
    var selectPackageName = req.params.packageName;
    logger.info("loginController 请求下载升级包:"+selectProductTypeInfo+","+selectPackageName);
    loginService.getFilePathAndLoad(selectProductTypeInfo,selectPackageName,req,res,function (data) {
        console.log("路径是："+data+" "+"文件名："+selectPackageName);
        // res.download(data,selectPackageName);
        res.send(data.toString());
    });
});
router.get('/downloadPackage/:productType/:packageName',function (req, res) {
    var productType = req.params.productType;
    var packageName = req.params.packageName;
    loginService.downloadPackage(productType,packageName,req,res,function (data) {
        console.info("下载结果:"+data);
    })
});
module.exports=router;