var util = require('./util')
var userModel = require('./../models/user');

var verify = {
	//验证token
	verifySign: function(params, sign) {
		var newSign = util.md5Salt(params).toUpperCase()
		if (newSign != sign) {
			return false
		}
		return true
	},
	//验证签名
	APIVerify: function() {
		return function(req, res, next) {
			//跳过签名
			var splitArr = req.originalUrl.split("?");
			if (splitArr[0] == "/v0/adminSchool/login") {
				return next()
			}
			if (!req.query.sign) {
				return res.send({
					code: 6060,
					message: '验证签名参数错误!',
				})
			}
			var urlString = req.originalUrl.substr(0, req.originalUrl.indexOf('sign='));
			var params = null;

			if (req.method == 'POST') {
				if (!req.body) {
					return res.send({
						code: 6061,
						message: '无JSON数据!',
					})
				}
				params = urlString + JSON.stringify(req.body);
			} else if (req.method == 'GET') {
				params = urlString
			} else {
				return next()
			}
			var result = verify.verifySign(params, req.query.sign)

			// if (!result) {
			// 	return res.send({
			// 		code: 6062,
			// 		message: '验证签名失败!',
			// 	})
			// }

			var userId = req.query.userId;
			var token = req.query.token;

			var arr = req.originalUrl.split("/");
			if (arr[2] == "adminSchool") {
				return next()
			}
			if (arr[2] == "getVerifyCode" ||
				arr[2] == "checkVerifyCode" ||
				arr[2] == "loginByToken" ||
				arr[2] == "login" ||
				arr[2] == "forgetPassword" ||
				arr[2] == "register" ||
				arr[2] == "uptoken" ||
				arr[2] == "getUserIdbyMobile") {
				return next()
			} else {
				if (!token || !userId) {
					return res.send({
						code: 6001,
						message: '缺少参数'
					});
				};
				if (userId) {
					userModel.findOne({
						_id: userId
					}, function(err, resultUser) {
						if (!err) {
							console.log("resultUser.token:", resultUser.token);
							console.log("1token:", token);
							if (resultUser.token !== token) {
								console.log('token验证失败！请重新登录')
								return res.send({
									code: "6005",
									message: 'token验证失败！请重新登录',
								});
							}
						} else {
							return res.send({
								code: 6003,
								message: 'token验证查询错误',
							});
						}
					});
				}
			}


			return next();
		}
	}



}

module.exports = verify;