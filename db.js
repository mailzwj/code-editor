var mongoose = require("mongoose");
var autoinc = require('mongoose-id-autoinc');
var db = null,
    Schema = null,
    pages = null;

mongoose.connect("mongodb://127.0.0.1:27017/mdemo");

db = mongoose.connection;

Schema = mongoose.Schema;

autoinc.init(db);

pages = new Schema({
    code: {type: String},
    pid: {type: Number},
    user: {type: String},
    createTime: {type: String}
});

pages.plugin(autoinc.plugin, {model: 'pages', field: "pid"});

mongoose.model("pages", pages);

db.on("error", function(err){
    console.log("Connect error. Error code: " + err);
});

exports.db = db;