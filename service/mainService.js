/**
 * Created by 7 on 2017/7/14.
 */
var process = require('child_process');
var logger = require('log')("all");
var crypto = require('crypto');
var fs = require('fs');
var os = require('os');
var readline = require('readline');
var stream = require('stream');
var suspend = require('suspend');
var resume = suspend.resume;
var http = require('http');
var path = require('path');
var url = require("url");
var formidable = require('formidable');
var FileUploadDao = require('../dao/UpGradePackageUploadDao');
fileUploadDao = new FileUploadDao();
var uuid = require('uuid');
var upgradePackageInfoDao = require('../dao/upgradePackageInfoDao');
var FileDownloadDao = require('../dao/UpGradePackageDownloadDao');
fileDownloadDao = new FileDownloadDao();
var rest = require('../rest/RestManager');

//******************************************************升级*** S ******************************************************
module.exports.UpgradePackageUpload = function (productType, fileDesc, versionDesc, upFileValue, versionCode, productDevice, req, res) {
    //上传文件到服务器
    console.log(upFileValue);
    upload(productType, fileDesc, versionDesc, upFileValue, versionCode, productDevice, req, res);
};
function upload(productType, fileDesc, versionDesc, upFileValue, versionCode, productDevice, req, res) {
    var flag;
    var uploadDir = "";
    var linux = os.platform() == 'linux' ? 1 : 0;
    if (linux) {
        uploadDir = "/etc/sysconfig/workspace";
    } else {
        uploadDir = "E:/workspace";//测试路径
    }
    var exists = fs.existsSync(uploadDir);
    console.log(exists ? "目录存在" : "目录不存在");
    if (!exists) {
        fs.mkdirSync(uploadDir);
    }
    var form = new formidable.IncomingForm();
    form.uploadDir = uploadDir;//必须设置
    form.encoding = 'utf-8';
    form.multiples = true;//设置为多文件上传
    form.keepExtensions = true;
    var selectPackageName, packageName;
    var downloadTimes = "0", versionNum = "1";

    var allFiles = [];
    // var fileInfo={
    //     productType : "",
    //     packageDesc:"",
    //     versionDesc:"",
    //     packageName : "",
    //     uploadPath : "",
    //     packageSize : "",
    //     versionNum:"",
    //     downloadTimes:"",
    // };

    form.on('file', function (name, file) {
        // packageName = file.name;

        // var fileInfo={};
        // fileInfo.packageName = packageName;
        // fileInfo.uploadPath = uploadDir + "/" + file.name;
        // fileInfo.packageSize = (file.size/1024).toFixed(2);
        // fileInfo.productType = productType;
        // fileInfo.packageDesc = fileDesc;
        // fileInfo.versionDesc = versionDesc;
        // fileInfo.downloadTimes = downloadTimes;
        // fileInfo.versionNum = versionNum;
        allFiles.push(file);
    });

    form.parse(req, function (error, fields, files) {
        if (error) {
            flag = false;
        } else {
            allFiles.forEach(function (file, index) {
                console.log("file:" + JSON.stringify(file));
                var oldPath = file.path;
                var newPath = uploadDir + "/" + file.name;
                var md5;
                fs.rename(oldPath, newPath, function (err) {
                    if (err) {
                        logger.info("改名失败");
                    } else {
                        fileUploadDao.selectUpGradePackagePackageName(upFileValue, function (err, vals) {
                            if (err) {
                                flag = false;
                                logger.info("查询文件名失败:" + err);
                                res.send({result: 0});
                            } else if (vals.length == 0) {
                                if (productType == "IPVT-ROM-01") {
                                    var rs = fs.createReadStream(newPath);
                                    var hash = crypto.createHash('md5');
                                    rs.on('data', hash.update.bind(hash));
                                    rs.on('end', function () {
                                        md5 = hash.digest('hex');
                                        fileUploadDao.getNodeIp(function (err, vals) {
                                            if (vals && vals.length > 0) {
                                                console.log(vals);
                                                var url = "http://" + vals[0].node_ip + ":6061/download/" + file.name
                                                var result = {
                                                    productDevice: productDevice,
                                                    fileUrl: url,
                                                    fileSize: file.size,
                                                    md5: md5,
                                                    release_note: versionDesc,
                                                    versionCode: versionCode
                                                }
                                                logger.info("rom上传信息>>>>>>>>" + JSON.stringify(result))
                                                var postUrl = "http://" + vals[0].node_ip + ":9003/uploadRomByUrl";
                                                postUrl = postUrl + "?&productDevice=" + productDevice + "&fileUrl=" + url + "&fileSize=" + file.size + "&md5=" + md5 + "&release_note=" + versionDesc + "&versionCode=" + versionCode
                                                rest.postRes(postUrl, result, function (data) {
                                                    if (data.result == true) {
                                                        logger.info("上传请求发送成功");
                                                        fileUploadDao.selectUpGradePackageVersionNum(productType, function (err, vals) {
                                                            logger.info("start db operation....")
                                                            if (err) {
                                                                flag = false;
                                                                logger.info("查询数据库失败=" + err);
                                                                if (flag) {
                                                                    res.send({result: 1});
                                                                } else {
                                                                    res.send({result: 0});
                                                                }
                                                            }
                                                            var fileInfo = {};
                                                            fileInfo.packageName = file.name;
                                                            fileInfo.uploadPath = uploadDir + "/" + file.name;
                                                            fileInfo.packageSize = (file.size / 1024).toFixed(2);
                                                            fileInfo.productType = productType;
                                                            fileInfo.packageDesc = fileDesc;
                                                            fileInfo.versionDesc = versionDesc;
                                                            fileInfo.downloadTimes = downloadTimes;
                                                            fileInfo.versionNum = versionNum;
                                                            if (vals && vals.length == 0) {
                                                                fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
                                                                    if (err) {
                                                                        logger.info("保存数据库失败:" + err);
                                                                        res.send({result: 0})
                                                                    } else {
                                                                        fileUploadDao.insertUpGradePackageRomInfo(productType, fileInfo.versionNum, productDevice, versionCode, function (err, vals) {
                                                                            if (err) {
                                                                                logger.error("insertUpGradePackageRomInfo失败:" + err);
                                                                                deletePackInfo(productType, fileInfo.versionNum, res);
                                                                                res.send({result: 0});
                                                                            } else {
                                                                                res.send({result: 1});
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            } else {
                                                                fileInfo.versionNum = vals[vals.length - 1].versionNum + 1;
                                                                fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
                                                                    if (err) {
                                                                        logger.info("更新数据库失败:" + err);
                                                                        res.send({result: 0})
                                                                    } else {
                                                                        fileUploadDao.insertUpGradePackageRomInfo(productType, fileInfo.versionNum, productDevice, versionCode, function (err, vals) {
                                                                            if (err) {
                                                                                logger.error("insertUpGradePackageRomInfo失败:" + err);
                                                                                deletePackInfo(productType, fileInfo.versionNum, res);
                                                                                res.send({result: 0});
                                                                            } else {
                                                                                res.send({result: 1});
                                                                            }
                                                                        });
                                                                    }

                                                                });
                                                            }
                                                        });
                                                    } else {
                                                        logger.info("上传请求发送失败")
                                                        res.send({result: 0});
                                                    }
                                                });

                                            } else {
                                                logger.info("查询本级节点IP失败")
                                                res.send({result: 0});
                                            }
                                        });
                                    });
                                } else {
                                    fileUploadDao.selectUpGradePackageVersionNum(productType, function (err, vals) {
                                        if (err) {
                                            flag = false;
                                            logger.info("查询数据库失败=" + err);
                                            if (flag) {
                                                res.send({result: 1});
                                            } else {
                                                res.send({result: 0});
                                            }
                                        }
                                        var fileInfo = {};
                                        fileInfo.packageName = file.name;
                                        fileInfo.uploadPath = uploadDir + "/" + file.name;
                                        fileInfo.packageSize = (file.size / 1024).toFixed(2);
                                        fileInfo.productType = productType;
                                        fileInfo.packageDesc = fileDesc;
                                        fileInfo.versionDesc = versionDesc;
                                        fileInfo.downloadTimes = downloadTimes;
                                        fileInfo.versionNum = versionNum;
                                        if (vals && vals.length == 0) {
                                            fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
                                                flag = true;
                                                if (err) {
                                                    logger.info("保存数据库失败:" + err);
                                                    flag = false;
                                                }
                                                if (flag) {
                                                    res.send({result: 1});
                                                } else {
                                                    res.send({result: 0});
                                                }
                                            });
                                        } else {
                                            fileInfo.versionNum = vals[vals.length - 1].versionNum + 1;
                                            fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
                                                flag = true;
                                                if (err) {
                                                    flag = false;
                                                    logger.info("更新数据库失败:" + err);
                                                }
                                                if (flag) {
                                                    res.send({result: 1});
                                                } else {
                                                    res.send({result: 0});
                                                }
                                            });
                                        }

                                    });
                                }
                            } else {
                                res.send({result: 3});
                            }
                        });
                    }
                });

            });
        }
    });

    form.on("end", function () {

    });

    function deletePackInfo(productType, versionNum, res) {
        suspend(function*() {
            try {
                yield upgradePackageInfoDao.deletePackageInfo(productType, versionNum, resume())
                res.send({result: 0});
            } catch (e) {
                res.send({result: 0});
            }
        })();
    }

    // fileUploadDao.selectUpGradePackagePackageName(upFileValue, function (err, vals) {
    //         selectPackageName = JSON.stringify(vals);
    //         if (err) {
    //             flag = false;
    //             logger.info("查询文件名失败:" + err);
    //         }
    //         if (selectPackageName.length == "2") {
    //             form.parse(req, function (error, fields, files) {
    //                 var oldPath = files.file.path;
    //                 var newPath = uploadDir + "/" + files.file.name;
    //                 fs.rename(oldPath, newPath, function (err) {
    //                     if (err) {
    //                         logger.info("改名失败");
    //                     }
    //                 });
    //                 if (error) {
    //                     flag = false;
    //                 }else if(!error) {
    //                     var selectVersionNum;
    //                     fileUploadDao.selectUpGradePackageVersionNum(productType, function (err, vals) {
    //                         selectVersionNum = JSON.stringify(vals);
    //                         console.log(selectVersionNum);
    //                         if (err) {
    //                             flag = false;
    //                             logger.info("查询数据库失败=" + err);
    //                             if(flag){
    //                                 res.send({result: 1});
    //                             }else{
    //                                 res.send({result: 0});
    //                             }
    //                         }
    //                         if (selectVersionNum.length == "2") {
    //                             fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
    //                                 flag = true;
    //                                 if (err) {
    //                                     logger.info("保存数据库失败:" + err);
    //                                     flag = false;
    //                                 }
    //                                 if(flag){
    //                                     res.send({result: 1});
    //                                 }else{
    //                                     res.send({result: 0});
    //                                 }
    //                             });
    //                         }
    //                         else {
    //                             fileInfo.versionNum = vals[vals.length - 1].versionNum + 1;
    //                             fileUploadDao.insertUpGradePackageInfo(fileInfo, function (err, vals) {
    //                                 flag = true;
    //                                 if (err) {
    //                                     flag = false;
    //                                     logger.info("更新数据库失败:" + err);
    //                                 }
    //                                 if(flag){
    //                                     res.send({result: 1});
    //                                 }else{
    //                                     res.send({result: 0});
    //                                 }
    //                             });
    //
    //                         }
    //
    //
    //                     });
    //                 }
    //             });
    //
    //             form.on("end", function () {
    //
    //             });
    //
    //         } else {
    //             res.send({result: 3});
    //         }
    //     });

}
module.exports.getProductionTypes = function (res) {
    console.log("进入获取所有产品类型服务");
    try {
        fileUploadDao.getProductionTypes(function (err, vals) {
            logger.info("vals" + JSON.stringify(vals));
            if (err) {
                logger.info("更新数据库失败:" + err);
                res.send([]);
            } else {
                res.send(vals);
            }


        });

    } catch (e) {

    }


};

/*****************************************************升级包管理*******************************************************/
//获取所有升级包信息
module.exports.getAllPackageInfosForPage = function (pageSize, pageIndex, res) {
    logger.info("进入获取所有升级包信息的服务,pageSize:" + pageSize + ",pageIndex:" + pageIndex);
    suspend(function*() {
        try {
            var allDatas = yield upgradePackageInfoDao.getAllPackageInfos(resume());
            var result = yield upgradePackageInfoDao.getAllPackageInfosForPage(pageSize, pageIndex, resume());
            // if(result.size()>0){
            //     for(var i in result){
            //
            //     }
            // }
            var data = {};
            data.total = allDatas.length;
            data.rows = result;
            res.json(data);
        } catch (e) {
            res.json({total: 0, rows: []});
        }
    })();
};
//根据产品类型获取升级包信息
module.exports.getPackageInfosByProductType = function (productType, pageSize, pageIndex, res) {
    logger.info("进入根据产品类型：" + productType + "获取所有升级包信息的服务,pageSize:" + pageSize + ",pageIndex:" + pageIndex);
    suspend(function*() {
        try {
            if (pageSize != null && pageIndex != null) {
                var a = yield upgradePackageInfoDao.getPackageInfosByPackageType(productType, resume());
                var result = yield upgradePackageInfoDao.getPackageInfosByTypeForPage(productType, pageSize, pageIndex, resume());
                var data = {};
                data.total = a.length;
                data.rows = result;
                res.json(data);
            } else {
                var a = yield upgradePackageInfoDao.getPackageByPackageType(productType, resume());
                res.json(a);
            }
        } catch (e) {
            res.json({total: 0, rows: []});
        }
    })();
};
//删除升级包信息
module.exports.deletePackageInfo = function (productType, versionNum, pageSize, pageIndex, res) {
    logger.info("按条件删除升级包信息,productType:" + productType + "versionNum：" + versionNum + ",pageSize:" + pageSize + ",pageIndex:" + pageIndex);

    var uploadDir = "";
    var linux = os.platform() == 'linux' ? 1 : 0;
    if (linux) {
        uploadDir = "/etc/sysconfig/workspace";
    } else {
        uploadDir = "E:\\workspace";//测试路径
    }
    if (productType == "IPVT-ROM-01") {
        logger.info("进入IPVT-ROM-01 删除操作")
        suspend(function*() {
            try {
                var romInfo = yield upgradePackageInfoDao.getRomInfoByProductTypeAndVersionNum(productType, versionNum, resume());
                logger.info("romInfo>>>" + JSON.stringify(romInfo))
                logger.info("romInfo.length>>>" + romInfo.length)
                if (romInfo && romInfo.length > 0) {
                    fileUploadDao.getNodeIp(function (err, vals) {
                        if (vals && vals.length > 0) {
                            logger.info("节点IP:" + vals);
                            var postUrl = "http://" + vals[0].node_ip + ":9003/delVersionByVcode";
                            postUrl = postUrl + "?&productDevice=" + romInfo[0].productDevice + "&versionCode=" + romInfo[0].versionCode
                            rest.postRes(postUrl, null, function (data) {
                                if (data.result == true) {
                                    logger.info("删除请求发送成功");
                                    suspend(function*() {
                                        try {
                                            //删除上传路径下的升级包
                                            var packageName = yield upgradePackageInfoDao.getPackageNameByProductTypeAndVersionNum(productType, versionNum, resume());
                                            fs.unlinkSync(uploadDir + "/" + packageName);
                                            //删除数据库里记录信息
                                            yield upgradePackageInfoDao.deleteRomInfo(productType, versionNum, resume())
                                            var result = yield upgradePackageInfoDao.deletePackageInfo(productType, versionNum, pageSize, pageIndex, resume());
                                            var allDatas = yield upgradePackageInfoDao.getAllPackageInfos(resume());
                                            var data = {};
                                            data.total = allDatas.length;
                                            data.rows = result;
                                            res.json(data);
                                        } catch (e) {
                                            res.json({total: 0, rows: []});
                                        }
                                    })();
                                } else {
                                    logger.info("删除请求发送失败")
                                    res.json({total: 0, rows: []});
                                }
                            });
                        }
                    });

                } else {
                    suspend(function*() {
                        try {
                            logger.info("没有找到rom表对应的信息")
                            var packageName = yield upgradePackageInfoDao.getPackageNameByProductTypeAndVersionNum(productType, versionNum, resume());
                            fs.unlinkSync(uploadDir + "/" + packageName);
                            //删除数据库里记录信息
                            var result = yield upgradePackageInfoDao.deletePackageInfo(productType, versionNum, pageSize, pageIndex, resume());
                            var allDatas = yield upgradePackageInfoDao.getAllPackageInfos(resume());
                            var data = {};
                            data.total = allDatas.length;
                            data.rows = result;
                            res.json(data);
                        } catch (e) {
                            logger.info("删除失败")
                            res.json({total: 0, rows: []});
                        }
                    })();
                }
            } catch (e) {
                res.json({total: 0, rows: []});
            }
        })();

    } else {
        suspend(function*() {
            try {
                logger.info("进入非 IPVT-ROM-01 删除操作")
                //删除上传路径下的升级包
                var packageName = yield upgradePackageInfoDao.getPackageNameByProductTypeAndVersionNum(productType, versionNum, resume());
                fs.unlinkSync(uploadDir + "/" + packageName);
                //删除数据库里记录信息
                var result = yield upgradePackageInfoDao.deletePackageInfo(productType, versionNum, pageSize, pageIndex, resume());
                var allDatas = yield upgradePackageInfoDao.getAllPackageInfos(resume());
                var data = {};
                data.total = allDatas.length;
                data.rows = result;
                res.json(data);
            } catch (e) {
                logger.info("删除失败")
                res.json({total: 0, rows: []});
            }
        })();
    }

};
//获取产品类型字典表信息
module.exports.getProductTypes = function (res) {
    upgradePackageInfoDao.getAllProductTypes(function (err, data) {
        if (err) {
            res.json([]);
        } else {
            res.json(data);
        }
    });
};
module.exports.downloadByProductTypeAndVersionNum = function (productType, versionNum, res) {

    // suspend(function*(){
    //     try{
    //         var data=yield upgradePackageInfoDao.getPackageInfoByProductTypeAndVersionNum(productType,versionNum,resume());
    //         var downloadTimes=data[0].downloadTimes+1;
    //         var c=fileDownloadDao.updataDowntimes(downloadTimes,data[0].productType,data[0].packageName,resume());
    //         console.log("c:"+JSON.stringify(c));
    //         console.log("要下载了。。。");
    //         res.download(data[0].uploadPath,data[0].packageName);
    //     }catch(e){
    //         console.log("下载失败:"+e.stack);
    //         res.send("error");
    //     }
    // })();
    upgradePackageInfoDao.getPackageInfoByProductTypeAndVersionNum(productType, versionNum, function (err, data) {
        if (err) {
            logger.error("下载失败:" + e.stack);
            res.send("error");
        } else {
            var downloadTimes = data[0].downloadTimes + 1;
            fileDownloadDao.updataDowntimes(downloadTimes, data[0].productType, data[0].packageName, function (err, vals) {
                if (err) {
                    logger.error("下载失败:" + e.stack);
                    res.send("error");
                } else {
                    logger.info("要下载了。。。");
                    res.download(data[0].uploadPath, data[0].packageName);
                }
            });
        }
    });
};

module.exports.downloadByPackageName = function (packageName,res) {
    upgradePackageInfoDao.getByPackageName(packageName,function (err, data) {
        if (err) {
            logger.error("根据包名查询失败");
            res.send("query error")
        } else {
            var downloadTimes = data[0].downloadTimes + 1;
            fileDownloadDao.updateDownloadTimes(downloadTimes,packageName,function (err,data) {
                if(err){
                    logger.error("更新下载次数失败");
                    res.send("update download times error");
                }else {
                    logger.info("更新下载次数成功");
                    res.send("success");
                }
            })
        }
    });
};