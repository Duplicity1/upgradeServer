/**
 * Created by Administrator on 2017/4/5.
 * 实现rest请求
 */
var logger = require('log')("all");
var request = require('request');
/**
 * 发送post请求
 * @param url
 * @param data
 */
module.exports.postRes = function (url, data, cb) {
    logger.info("发送post请求，url:" + url);
    request({
        url: encodeURI(url),
        method: "POST",
        json: true,
        headers: {
            "content-type": "text/plain;charset=UTF-8",
        },
        body: data
    }, function (error, response, body) {
        var msg = {}
        if (!error && response.statusCode == 200) {
            logger.info("返回结果》》》" + response.body)
            if (response.body == "上传成功") {
                msg.result = true;
                cb(msg)
            } else if (response.body == "删除成功") {
                msg.result = true;
                cb(msg)
            } else {
                msg.result = false;
                cb(msg);
            }
        } else {
            logger.error("post失败错误:" + error);
            msg.result = false;
            cb(msg);
        }
    });
}
module.exports.deleteRes = function (url) {
    logger.info("发送DELETE请求，url:" + url);
    request({
        url: url,
        method: "DELETE",
        json: true,
        headers: {
            "content-type": "application/json",
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            logger.info(url + "请求成功");
        }
    });
}
