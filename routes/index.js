var express = require('express');
var router = express.Router();
var db = require("../db").db;
var col = db.model("pages");

var parseNumber = function(num) {
    return num < 10 ? "0" + num : num;
};

var dateFormat = function(date, formatStr) {
    var dateObj = {},
        rStr = /\{([^}]{1,2})\}/;
    
    dateObj["Y"] = date.getFullYear();
    dateObj["M"] = date.getMonth() + 1;
    dateObj["MM"] = parseNumber(dateObj["M"]);
    dateObj["D"] = date.getDate();
    dateObj["DD"] = parseNumber(dateObj["D"]);
    dateObj["h"] = date.getHours();
    dateObj["hh"] = parseNumber(dateObj["h"]);
    dateObj["i"] = date.getMinutes();
    dateObj["ii"] = parseNumber(dateObj["i"]);
    dateObj["s"] = date.getSeconds();
    dateObj["ss"] = parseNumber(dateObj["s"]);

    while(rStr.test(formatStr)) {
        formatStr = formatStr.replace(rStr, dateObj[RegExp.$1]);
    }
    return formatStr;
};

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: '在线代码编辑器',
        pagename: 'index'
    });
});

router.get('/create', function(req, res) {
    var codeRecord = new col({
        code: '<!DOCTYPE HTML>\n'
            + '<html>\n'
            + '<head>\n\t'
            + '<meta charset="utf-8">\n\t'
            + '<title>Document</title>\n'
            + '</head>\n'
            + '<body>\n\t'
            + '<!-- Your code here. -->\n'
            + '</body>\n'
            + '</html>',
        createTime: dateFormat(new Date(), '{Y}/{MM}/{DD} {hh}:{ii}:{ss}')
    });
    // console.log(codeRecord);
    codeRecord.save(function(err){
        if (err) {
            throw err;
            res.send({
                'status': 'failure',
                'message': 'Create Error, Please try again later!'
            });
        } else {
            col.find({}, function(err, rs){
                if (err) {
                    throw err;
                    res.send({
                        'status': 'failure',
                        'message': 'Please try again!'
                    });
                } else {
                    res.redirect('/edit/' + rs[rs.length - 1].pid);
                }
            });
        }
    });
});

router.get('/edit/:id', function(req, res) {
    var query = req.params,
        pid = query["id"];

    // console.log("id:", pid);
    col.find({pid: pid}, function(err, rs){
        if (err) {
            throw err;
            res.send({
                'status': 'failure',
                'message': 'Code not found!'
            });
        } else {
            res.render('edit', {
                title: '在线代码编辑器',
                pagename: 'edit',
                pid: rs[0].pid,
                code: rs[0].code
            });
        }
    });
});

router.all('/save', function(req, res){
    var pid = req.params["id"] || req.body["id"] || req.query["id"],
        code = decodeURIComponent(req.params["code"] || req.body["code"] || req.query["code"]),
        cb = req.params["callback"] || req.body["callback"] || req.query["callback"] || "jsonp";

    col.update({pid: pid}, {$set: {code: code}}, function(err){
        if (err) {
            throw err;
            return false;
        } else {
            res.send(cb + "({"
                + "\"status\": \"success\","
                + "\"pid\": " + pid
            + "})");
        }
    });
});

router.get('/preview/:id', function(req, res){
    var pid = req.query["id"] || req.params["id"];

    res.setHeader("Content-Type", "text/html");
    col.find({pid: pid}, function(err, rs){
        if (err) {
            throw err;
            return false;
        } else {
            res.send(rs[0].code);
        }
    });
});

router.get('/list', function(req, res){
    col.find({}).sort({"createTime": "desc"}).exec(function(err, rs){
        if (err) {
            throw err;
            res.send({
                "status": "failure",
                "message": "Please try again later."
            });
        } else {
            res.render('list', {
                title: '在线代码编辑器 - 代码列表',
                pagename: 'list',
                results: rs
            });
        }
    });
});

router.get('/clone/:id', function(req, res) {
    var pid = req.query["id"] || req.params["id"];
    col.find({pid: pid}, function(err, rs){
        if (err) {
            throw err;
            res.send({
                "status": "failure",
                "message": "Please try again later!"
            });
        } else {
            var codeRecord = new col({
                code: rs[0].code,
                createTime: dateFormat(new Date(), '{Y}/{MM}/{DD} {hh}:{ii}:{ss}')
            });
            // console.log(codeRecord);
            codeRecord.save(function(err){
                if (err) {
                    throw err;
                    res.send({
                        'status': 'failure',
                        'message': 'Create Error, Please try again later!'
                    });
                } else {
                    col.find({}, function(err, rs){
                        if (err) {
                            throw err;
                            res.send({
                                'status': 'failure',
                                'message': 'Please try again!'
                            });
                        } else {
                            res.redirect('/edit/' + rs[rs.length - 1].pid);
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;