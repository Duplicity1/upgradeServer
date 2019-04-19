/**
 * Created by zm on 2017/03/22.
 */
var query=require('../dbconnect/dbpool');
var FileUploadInfo=function(){};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

FileUploadInfo.prototype.insertUpGradePackageInfo=function(fileInfo,cb){
    try{
        console.log("fileInfo:"+JSON.stringify(fileInfo));
        var sql="insert into upgrade_package_info(productType,versionNum,packageSize,packageName,uploadPath,downloadTimes,packageDesc,versionDesc) values('{0}','{1}',{2},'{3}','{4}','{5}','{6}','{7}')";
        sql=sql.format(fileInfo.productType,fileInfo.versionNum,fileInfo.packageSize,fileInfo.packageName,fileInfo.uploadPath,fileInfo.downloadTimes,fileInfo.packageDesc,fileInfo.versionDesc);
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(err){
        cb(err,"error");
    }
};

FileUploadInfo.prototype.insertUpGradePackageRomInfo=function(productType,versionNum,productDevice,versionCode,cb){
    try{
        var sql="insert into upgrade_package_rom_info(productType,versionNum,productDevice,versionCode) values('{0}','{1}','{2}','{3}')";
        sql=sql.format(productType,versionNum,productDevice,versionCode);
        console.log("insertUpGradePackageRomInfo sql>>>"+sql)
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(err){
        cb(err,"error");
    }
};


FileUploadInfo.prototype.selectUpGradePackageVersionNum=function(param,cb){
    try{
        var sql="select versionNum from upgrade_package_info where productType = '"+param+"'";
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileUploadInfo.prototype.selectUpGradePackagePackageName=function(param,cb){
    try{
        var sql="select * from upgrade_package_info where packageName = '"+param+"'";
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileUploadInfo.prototype.updateUpGradePackageVersionNum=function(param,cb){
    try{
        var sql="update upgrade_package_info set VersionNum='{0}'";
        sql=sql.format(param);
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileUploadInfo.prototype.getProductionTypes=function(cb){
    try{
        var sql="select typeCode,typeName from dict_producttype_tab";
        console.log(sql);
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileUploadInfo.prototype.getNodeIp=function(cb){
    try{
        var sql="select node_ip from sys_service_node_tab";
        console.log(sql);
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};

module.exports=FileUploadInfo;