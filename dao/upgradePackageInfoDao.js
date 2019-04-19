/**
 * Created by zm on 2017/7/17.
 */
var query = require('../dbconnect/dbpool');
var logger = require('log')(__filename);

module.exports.getAllPackageInfos = function (cb) {
    // var sql="select * from upgrade_package_info ";
    var sql = "select a.typeName as productType,b.versionNum,b.packageSize,b.packageName,b.uploadPath,DATE_FORMAT(b.uploadTime, '%Y-%m-%d %H:%i:%s') as uploadTime,b.downloadTimes," +
        "b.packageDesc,b.versionDesc from upgrade_package_info as b,dict_producttype_tab as a where a.typeCode=b.productType";
    console.log("获取所有升级包信息：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};

module.exports.getAllPackageInfosForPage = function (pageSize, pageIndex, cb) {
    // var sql="select * from upgrade_package_info limit "+(pageIndex-1)+","+pageSize;

    var sql = "select a.typeName as productType,b.versionNum,b.packageSize,b.packageName,b.uploadPath,DATE_FORMAT(b.uploadTime, '%Y-%m-%d %H:%i:%s') as uploadTime,b.downloadTimes," +
        "b.packageDesc,b.versionDesc from upgrade_package_info as b,dict_producttype_tab as a where a.typeCode=b.productType limit " + (pageIndex - 1) + "," + pageSize;

    console.log("获取所有升级包分页信息：" + sql);
    query(sql, function (err, vals, fields) {
        console.log("获取所有升级包分页信息结果：" + JSON.stringify(vals));
        cb(err, vals);
    });
};

module.exports.getPackageInfosByPackageType = function (productType, cb) {
    // var sql="select * from upgrade_package_info where productType='"+productType+"'";
    var sql = "select a.typeName as productType,b.versionNum,b.packageSize,b.packageName,b.uploadPath,DATE_FORMAT(b.uploadTime, '%Y-%m-%d %H:%i:%s') as uploadTime,b.downloadTimes," +
        "b.packageDesc,b.versionDesc from upgrade_package_info as b,dict_producttype_tab as a where a.typeCode=b.productType and b.productType='" + productType + "'";
    console.log("根据产品类型获取升级包信息：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};

module.exports.getPackageByPackageType = function (productType, cb) {
    var sql = "select * from upgrade_package_info where productType='" + productType + "' order by uploadTime DESC";
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};

module.exports.getPackageInfosByTypeForPage = function (productType, pageSize, pageIndex, cb) {
    // var sql="select * from upgrade_package_info where productType='"+productType+"'  limit "+(pageIndex-1)+","+pageSize;
    var sql = "select a.typeName as productType,b.versionNum,b.packageSize,b.packageName,b.uploadPath,DATE_FORMAT(b.uploadTime, '%Y-%m-%d %H:%i:%s') as uploadTime,b.downloadTimes," +
        "b.packageDesc,b.versionDesc from upgrade_package_info as b,dict_producttype_tab as a where a.typeCode=b.productType and b.productType='" + productType + "' limit " + (pageIndex - 1) + "," + pageSize;
    console.log("根据产品类型获取升级包分页信息：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};

module.exports.deletePackageInfo = function (productType, versionNum, cb) {
    var sql = "delete  from upgrade_package_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("删除升级包信息：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
}

module.exports.deletePackageInfo = function (productType, versionNum, pageSize, pageIndex, cb) {
    var sql = "delete  from upgrade_package_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("删除升级包信息：" + sql);
    query(sql, function (err, vals, fields) {
        if (err) {
            cb(err, vals);
        } else {
            // var sql2="select * from upgrade_package_info limit "+(pageIndex-1)+","+pageSize;
            var sql2 = "select a.typeName as productType,b.versionNum,b.packageSize,b.packageName,b.uploadPath,DATE_FORMAT(b.uploadTime, '%Y-%m-%d %H:%i:%s') as uploadTime,b.downloadTimes," +
                "b.packageDesc,b.versionDesc from upgrade_package_info as b,dict_producttype_tab as a where a.typeCode=b.productType limit " + (pageIndex - 1) + "," + pageSize;
            console.log("删除后，获取所有升级包信息：" + sql2);
            query(sql2, function (err, vals, fields) {
                cb(err, vals);
            });
        }

    });
};
//删除romInfo
module.exports.deleteRomInfo = function (productType, versionNum, cb) {
    var sql = "delete  from upgrade_package_rom_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("删除romInfo ：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};


//根据产品类型和版本号得到升级包名称
module.exports.getPackageNameByProductTypeAndVersionNum = function (productType, versionNum, cb) {
    var sql = "select packageName from upgrade_package_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("根据产品类型和版本号得到升级包名称：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals[0].packageName);
    });
};
//根据产品类型和版本号得到rom产品类型和版本号
module.exports.getRomInfoByProductTypeAndVersionNum = function (productType, versionNum, cb) {
    console.log("根据产品类型和版本号得到rom产品类型和版本号")
    var sql = "select productDevice,versionCode from upgrade_package_rom_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("根据产品类型和版本号得到rom产品类型和版本号：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};

/********************获取产品类型字典表信息**********************/
module.exports.getAllProductTypes = function (cb) {
    var sql = "select * from dict_producttype_tab";
    query(sql, function (err, vals, fields) {
        console.log("获取产品类型字典表信息:" + JSON.stringify(vals));
        cb(err, vals);
    });
};
//根据产品类型和版本号得到升级包信息
module.exports.getPackageInfoByProductTypeAndVersionNum = function (productType, versionNum, cb) {
    var sql = "select * from upgrade_package_info where productType='" + productType + "' and  versionNum=" + versionNum;
    console.log("根据产品类型和版本号得到升级包信息：" + sql);
    query(sql, function (err, vals, fields) {
        cb(err, vals);
    });
};
//根据产品包名packageName查询
module.exports.getByPackageName = function (packageName, cb) {
    var sql = "select * from upgrade_package_info where packageName='" + packageName+"'";
    console.log("根据产品包名packageName查询：" + sql);
    query(sql, function (err, vals) {
        cb(err, vals);
    });
};
