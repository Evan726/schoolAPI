var managerModel = require('../../models/manager');
var mongoose = require("mongoose");
var common = require("./common");
var util = require('../../utils/util.js');

module.exports = (function() {
	var fn = {
		managerLogin:function(req, res){
			common.managerVerify(req, res, function(){
				var body = req.body
				if (!body.username || !body.password) {
					common.error(res, "6000", "缺少参数");
				};
				var query = {
					username: body.username,
					password: body.password
				};
				managerModel.findOne(query, function(err, user) {
					if (!err && user) {
						user.token = util.md5Salt(body.username + body.password).toUpperCase();
						managerModel.update({
							_id: user._id
						}, {
							$set: {
								token: user.token,
								lastLoginTime: new Date()
							}
						}, function(err, result) {
							if (!err && !!result) {
								res.send({
									code: "0000",
									message: 'ok',
									result: {
										token: user.token,
										userId: user._id,
										username: user.username
									}
								});
							} else {
								return common.errorPrint(res, "6001", err, "login.managerLogin", "保存数据错误");
							}
						});
					} else {
						return common.error(res, "6001", "无此用户");
					}
				});
			});
		}
	}
	return fn;
})();