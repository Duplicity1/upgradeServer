/**
 * Created by zm on 2017/05/24.
 */
define([], function () {
    return {
        defaultRoute: "/login",
        routes: {
            "login": {
                templateUrl: "views/login.html",
                url: "/login",
                dependencies: ["controller/loginController"],
                allowAnonymous: true
            },
            "main": {
                templateUrl: "views/main.html",
                url: "/main",
                dependencies:["controller/mainController"],
                allowAnonymous: true
            },
            "downloadPage": {
                templateUrl: "views/downloadPage.html",
                url: "/downloadPage",
                dependencies:["controller/downloadPageController"],
                allowAnonymous: true
            }
            
        }
    }
});