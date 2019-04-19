/**
 * Created by 7 on 2017/7/18.
 */
var query=require('../dbconnect/dbpool');
var FileDownloadInfo=function(){};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};
FileDownloadInfo.prototype.selectUpGradePackagePackageName=function(productType,cb){
    try{
        var sql="select packageName,versionDesc from upgrade_package_info where productType='"+productType+"'";
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileDownloadInfo.prototype.selectUpGradePackageVersionDesc=function(productType,cb){
    try{
        var sql="select versionDesc from upgrade_package_info where productType='"+productType+"'";
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileDownloadInfo.prototype.selectUpGradePackageProductType=function(cb){
    try{
        var sql="select distinct productType from upgrade_package_info";
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileDownloadInfo.prototype.getFilePath=function(selectProductTypeInfo,selectPackageName,cb){
    try{
        var sql="select downloadTimes,uploadPath from upgrade_package_info where productType='"+selectProductTypeInfo+"'and packageName= '"+selectPackageName+"'";
        console.log(sql);
        query(sql,function(err,vals,fields){
            cb(err,vals);
        });
    }catch(ex){
        cb(ex,"error");
    }
};
FileDownloadInfo.prototype.updataDowntimes=function(downloadTimes,selectProductTypeInfo,selectPackageName,cb){

    var sql="update upgrade_package_info set downloadTimes={0} where productType='"+selectProductTypeInfo+"' and packageName='"+selectPackageName+"'";
    sql=sql.format(downloadTimes);
    console.log(sql);
    query(sql,function(err,vals,fields){
        cb(err,vals);
    });

};
FileDownloadInfo.prototype.updateDownloadTimes=function(downloadTimes,selectPackageName,cb){

    var sql="update upgrade_package_info set downloadTimes={0} where packageName='"+selectPackageName+"'";
    sql=sql.format(downloadTimes);
    console.log(sql);
    query(sql,function(err,vals){
        cb(err,vals);
    });

};
module.exports=FileDownloadInfo;