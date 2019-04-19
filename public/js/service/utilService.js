/**
 * Created by zm on 2017/5/25.
 */
define(['app'],function(app){
    app.service('utilService',function(){
        console.log('util service init...');
        //获取系统当前语言类型
        return{
            getSystemLanguage:function(){
                var lang=window.localStorage.getItem("lan");
                return lang;
            }
        }

    });
});