/**
 * Created by zm on 2017/5/24.
 */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require("express-session");
var bodyParser = require('body-parser');
var os = require('os');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
var linux = os.platform() == 'linux' ? 1 : 0;
var uploadDir = "/etc/sysconfig/workspace";
if (linux) {
    uploadDir = "/etc/sysconfig/workspace";
} else {
    uploadDir = "H:\\upload";
}
app.use("/download",express.static(path.join(uploadDir)))
app.use(session({secret: 'keyboard cat', resave: false, saveUninitialized: true, cookie: {maxAge: null}}));

var mainController=require('./controller/mainController');
var loginController=require('./controller/loginController');
app.use('/fxrest',mainController);
app.use('/fxrest',loginController);



module.exports = app;