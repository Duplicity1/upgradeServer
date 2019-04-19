/**
 * Created by zm on 2017/3/14.
 */
//导入所需模块
var mysql=require("mysql");
//导入配置文件
var cfg  =require("./dbInfo.json");
//zc网关数据库连接池
var pool = mysql.createPool({
    host:      cfg.zcgateway_db.host,
    user:      cfg.zcgateway_db.user,
    password:  cfg.zcgateway_db.password,
    database:  cfg.zcgateway_db.db,
    port:      cfg.zcgateway_db.port,
    connectionLimit:3
});

//导出查询相关
var query=function(sql,callback){
    try{
        pool.getConnection(function(err,conn){
            if(err){
                callback(err,null,null);
            }else{
                conn.query(sql,function(qerr,vals,fields){
                    //释放连接
                    conn.release();
                    //事件驱动回调
                    callback(qerr,vals,fields);
                });
            }
        });
    }catch (ex){
        console.log("----------------------------",ex);
    }

};
module.exports=query;
