var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

mongoose.connect('mongodb://127.0.0.1/SchoolVersion', function(err) {
	if (err) {
		console.log('数据库连接失败');
	} else {
		console.log('数据库SchoolVersion连接成功');
	}
}); //连接数据库

var express = require('express');
var app = express();

//设置端口
app.set('port', 3003);

//设置上传格式以及上传文件大小
app.use(bodyParser.json({
	limit: '50mb'
}));
app.use(bodyParser.urlencoded({
	limit: '50mb',
	extended: false
}));



app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
	res.header("Access-Control-Allow-Methods", "POST,GET");
	res.header("X-Powered-By", ' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();

});

app.use('/v0', routes);


// app.get('/', function(req, res) {
// 	res.send('Hello World');
// })


var server = http.createServer(app);
server.listen(app.get('port'));

server.on('listening', function() {
	console.log('----------listening on port: ' + app.get('port') + '----------');
});