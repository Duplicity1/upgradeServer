/**
 * Created by 7 on 2017/7/18.
 */
var process = require('child_process');
var logger = require('log')("all");
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
var FileDownloadDao = require('../dao/UpGradePackageDownloadDao');
fileDownloadDao = new FileDownloadDao();
var uuid = require('uuid');
var mime = require('mime');
var downloadTimes;

//获取下载文件信息
module.exports.getDownloadInfo = function (param, req, res) {
    //获取服务器中的文件信息
    getDownloadInfo(param, function (data) {
        res.send(data);
    });
};
function getDownloadInfo(productType, cb) {
    fileDownloadDao.selectUpGradePackagePackageName(productType, function (err, vals) {
        console.log("vals:" + JSON.stringify(vals));
        cb(vals);
        if (err) {
            console.log("保存数据库失败:" + err);
        }
    });
    fileDownloadDao.selectUpGradePackageVersionDesc(productType, function (err, vals) {
        console.log("vals:" + JSON.stringify(vals));
        if (err) {
            console.log("保存数据库失败:" + err);
        }
    })
}
//获取产品类别信息
module.exports.getProductTypeInfo = function (req, res) {
    //获取服务器中的文件信息
    getProductTypeInfo(function (data) {
        res.send(data);
    });
};
function getProductTypeInfo(cb) {
    fileDownloadDao.selectUpGradePackageProductType(function (err, vals) {
        console.log("vals:" + JSON.stringify(vals));
        cb(vals);
        if (err) {
            console.log("保存数据库失败:" + err);
        }
    })
}
//通过文件类型和文件名字找到文件的存放地址
module.exports.getFilePathAndLoad = function (selectProductTypeInfo, selectPackageName, req, res, cb) {
    //获取服务器中的文件信息
    getFilePathAndLoad(selectProductTypeInfo, selectPackageName, function (data) {
        if (data != "err") {
            downloadTimes = data[0].downloadTimes + 1;
            cb(data[0].uploadPath)
            download(data[0].uploadPath,selectPackageName,res);
        } else {
            res.send("err");
        }
        console.log("downloadTimes:" + downloadTimes);
        fileDownloadDao.updataDowntimes(downloadTimes, selectProductTypeInfo, selectPackageName, function (err, vals) {
            if (err) {
                console.log("更新下载次数失败:" + err);
            }
        });
    });
};
function getFilePathAndLoad(selectProductTypeInfo, selectPackageName, cb) {
    fileDownloadDao.getFilePath(selectProductTypeInfo, selectPackageName, function (err, vals) {
        console.log("vals:" + JSON.stringify(vals));
        if (JSON.stringify(vals).length != "2") {
            cb(vals);
        } else {
            cb("err");
        }
        if (err) {
            console.log("保存数据库失败:" + err);
        }
    });
};

//下载文件
module.exports.downloadPackage = function (productType, packageName, req, res, cb) {
    //开始下载文件
    fileDownloadDao.getFilePath(productType, packageName, function (err, data) {
        console.log("vals:" + JSON.stringify(data));
        try {
            if (JSON.stringify(data).length != "2") {
                downloadTimes = data[0].downloadTimes + 1;
                //文件名称
                var name = packageName;
                //文件路径
                var path = data[0].uploadPath;
                //文件大小
                var size = fs.statSync(path).size;
                //判断浏览器，设置回复头信息，这里一定要设置，否则下载文件名会乱码
                var userAgent = (req.headers['user-agent']||'').toLowerCase();
                if(userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
                    //如果是msie浏览器，文件名转码方式
                    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(name));
                } else if(userAgent.indexOf('firefox') >= 0) {
                    //如果是火狐浏览器，文件名转码方式
                    res.setHeader('Content-Disposition', 'attachment; filename*="utf8\'\'' + encodeURIComponent(name)+'"');
                } else {
                    /* safari等其他非主流浏览器只能自求多福了 */
                    res.setHeader('Content-Disposition', 'attachment; filename=' + new Buffer(name).toString('binary'));
                }
                //设置头信息下载类型为二进制文件，且为utf-8的编码格式
                res.setHeader('Content-Type', 'application/octet-stream;charset=utf8');
                //设置头信息文件大小
                res.setHeader('Content-Length', size);
                //获取文件流
                var stream = fs.createReadStream(path);
                //将文件流用回复管道推出去
                stream.pipe(res);
                stream.on('close', function () {
                    cb("下载完成："+name);
                });
            } else {
                cb("err");
            }
        } catch (e) {
            console.error("下载升级包失败:" + e);
        }
        if (err) {
            console.log("查询升级包地址失败:" + err);
        }
        console.log("downloadTimes:"+downloadTimes);
        fileDownloadDao.updataDowntimes(downloadTimes,productType,packageName,function (err, vals) {
            if (err) {
                console.log("更新下载次数失败:" + err);
            }
        });
    });
};

function download(filePath, fileName, res) {
    fs.readFile(filePath, 'binary', function (err, file) {
        console.log("开始执行下载过程");
        if (err) {
            responseError(res, err.message, 500);
        } else {
            var contentType = mime.lookup(filePath);
            console.log("111111111contentType:" + contentType);
            //设置文件格式与文件名，支持ie,chrome
            // res.set({
            //     "Content-type":"application/octet-stream",
            //     "Content-Disposition":"attachment;filename="+encodeURI(fileName)
            // });
            res.writeHead(200, {
                'Content-Type': "application/octet-stream",
                'Content-Disposition': "attachment;fileName=" + encodeURIComponent(fileName)
            });
            res.write(file, "binary");
            res.end();
        }
    })
}
function Download(filePath, FileName, res) {
    var currDir = filePath,
        fileName = FileName,
        currFile = path.join(currDir),
        fReadStream;
    fs.exists(currFile, function (exist) {
        if (exist) {
            res.set({
                "Content-type": "application/force-download",
                "Content-Disposition": "attachment;filename=" + encodeURIComponent(fileName)
            });
            fReadStream = fs.createReadStream(currFile);
            console.log(fReadStream);
            if (true) {
                fReadStream.on("data", (chunk) => res.write(chunk, "binary"));
                console.log("执行了");
            }
            fReadStream.on("end", function () {
                console.log("也执行了！！")
                res.end();
            });
        } else {
            res.set("Content-type", "text/html");
            res.send("file not exist!");
            res.end();
        }
    });
    
}
