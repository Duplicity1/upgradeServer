/**
 * Created by zm on 2017/5/25.
 */
define(['app','i18n_zh','i18n_en','service/utilService','service/loginService'],function(app,i18n_zh,i18n_en){
    app.controller('loginController',function($scope,$compile,$state,$translate,utilService,loginService){
        console.log('login controller init...');
        //初始化参数
        $scope.userName='';
        $scope.password='';
        $scope.errortips=null;
        // $scope.href="http://"+window.location.host+"/sip/imv_web_plugin.exe";
        $("#errormesg").hide();
        if(!window.localStorage.getItem("lan")){
            //默认设置为中文
            window.localStorage.setItem("lan","zh");
            $scope.language='zh';
        }
        //获取保存的用户名
        $scope.userName =localStorage.getItem("rew");
        //判断是否保存复选框选中状态
        if($scope.userName){
            $scope.checkOrNO=true;
        }else{
            $scope.checkOrNO=false;
        }


        var lang = utilService.getSystemLanguage();
        $translate.use(lang);
        $scope.language=lang;
        //登录
        $("#errormesg").hide();
        var language;
        if (lang == "zh") {
            language = i18n_zh;
        } else if (lang == "en") {
            language = i18n_en;
        } else {
            language = i18n_zh;
        }
        $scope.login=function(){
            console.log("userName:"+$scope.userName+',password:'+$scope.password);
            if($scope.userName==""||$scope.userName==null){
                $scope.errortips=language.inputMessage;
                $("#errormesg").show();
                return;
            }
            if($scope.userName.length>16){
                $scope.errortips=language.userNameLength;
                $("#errormesg").show();
                return;
            }
            if(($scope.password==""||$scope.password==null)&&($scope.userName!=""||$scope.userName!=null)){
                $scope.errortips=language.inputPWD;//请输入密码
                $("#errormesg").show();
                return;
            }
            if($scope.password.length>16){
                $scope.errortips=language.passwordLength;
                $("#errormesg").show();
                return;
            }

            if(($scope.userName=="admin"&& $scope.password=="123456")){

                setCookie($scope.userName);
                $state.go("main");
            } else{
                $scope.errortips=language.inputError;//用户名或密码错误
                $("#errormesg").show();
            }
            //用户名密码进行相关判断后再跳转到主界面;
        };
        //选择语言
        $scope.selectChange=function(lan){
            if(lan=="zh"){
                window.localStorage.setItem("lan","zh");
            }else if(lan=="en"){
                window.localStorage.setItem("lan","en");
            }
            if(lang!=lan){
                window.location.reload();
            }
        };

        document.onkeydown=function(event){
            var e = event || window.event || arguments.callee.caller.arguments[0];
            if(e && e.keyCode==13){
                $scope.login();
                $scope.$apply();
            }
        };
        function setCookie(userName)  {
            document.cookie="userName="+userName;
        };

        //保存用户名
        $scope.saveUser=function() {
            var tf=loginService.trueOrfalse("login_input_checkbox");
            if(tf){
                localStorage.setItem("rew", $scope.userName);
                localStorage.setItem("tfstatus",1);
            } else{
                localStorage.setItem("rew", '');
            }
        };

       //  $scope.ProductionTypes=[];
       //  getProductTypeInfo();
       //  //获取所有产品类型的数据
       //  function getProductTypeInfo(){
       //      loginService.getProductTypeInfo(function (data) {
       //          console.log("data:"+JSON.stringify(data));
       //          var now = data[0];
       //          if(!now) return;
       //          for(var i in data ){
       //              $scope.ProductionTypes.push(data[i].productType);
       //          }
       //          $scope.selectProductTypeInfo=data[0].productType;
       //          console.log("$scope.ProductionTypes:  "+$scope.ProductionTypes);
       //          getDownLoadInfo($scope.selectProductTypeInfo);
       //      })
       //  }
       // //根据产品类型的参数获取对应的上传的数据
       //  function getDownLoadInfo(productType){
       //      angular.element("#version_table").empty();
       //      angular.element("#version_table_history").empty();
       //      loginService.downloadInfo(productType,function (data) {
       //          console.log("data1:"+JSON.stringify(data));
       //           var content = "<tr><td><p class='font-color'>文件名:</p></td><td><p class='font-color'>"+data[data.length-1].packageName+"</p></td></tr>" +
       //              "<tr><td><p class='font-color'>版本描述:</p></td><td><p class='font-color'>"+data[data.length-1].versionDesc+"</p></td></tr>"+
       //              "<tr><td><a class='downloadFileButton' ng-click=\"fileDownLoad(\'"+data[data.length-1].packageName+"\')\">下载</a></td></tr>";
       //          content+="<tr><td><p style=\"padding: 5px;\"><a class='downloadFileButton' class='font-color' class='font-color' ng-click='showHistory()'>更多:</a></p></td></tr>";
       //          var template = angular.element(content);
       //          var newElement = $compile(template)($scope);
       //          angular.element("#version_table").append(newElement);
       //
       //          if(data){
       //              var contentAll="";
       //              for(var i=data.length-2;i>=0;i--){
       //               contentAll+= "<tr><td><p class='font-color'>文件名:</p></td><td><p class='font-color'>"+data[i].packageName+"</p></td></tr>" +
       //                  "<tr><td><p class='font-color'>版本描述:</p></td><td><p class='font-color'>"+data[i].versionDesc+"</p></td></tr>"+
       //                  "<tr><td><a class='downloadFileButton' class='font-color' ng-click=\"fileDownLoad(\'"+data[i].packageName+"\')\">下载</a></td></tr>";
       //                  contentAll+="<tr ><td colspan=\"2\"><hr align=\"center\" width=\"100%\" color=\"#B1B1B1\" size=\"1\" " +
       //                      "style='border: 20px;border-top: 2px solid #B1B1B1;margin: 10px;width: 250px'/></td></tr>";
       //              }
       //          }
       //          console.log(contentAll);
       //          var template1 = angular.element(contentAll);
       //          var newElement1 = $compile(template1)($scope);
       //          angular.element("#version_table_history").append(newElement1);
       //          $('#history_div').css('display', 'none');
       //      });
       //  }
       //  //改变产品类型后获取的数据
       //  $scope.getAllDownLodInfo=function () {
       //      getDownLoadInfo($scope.selectProductTypeInfo);
       //  }
       //  //下载文件
       //  $scope.fileDownLoad=function(param){
       //      console.log("param:"+param);
       //      window.location.href="/files/"+param;
       //      getFilePathAndLoad($scope.selectProductTypeInfo,param);
       //  }
       //  function getFilePathAndLoad(selectProductTypeInfo,selectPackageName) {
       //      loginService.getFilePathAndLoad(selectProductTypeInfo,selectPackageName,function () {
       //
       //      });
       //  }
       //  var showFlag=false;
       //  $scope.showHistory=function () {
       //      console.log("showHistory");
       //      if (!showFlag){
       //          $('#history_div').css('display', 'block');
       //          showFlag=true;
       //      }else{
       //          $('#history_div').css('display', 'none');
       //          showFlag=false;
       //      }
       //  }
            $scope.loadFile=function(){
                $state.go("downloadPage");
            }


    })
});