var util = require('../utils/util.js');
var userModel = require('./../models/user');
var verifyModel = require('./../models/verifyCode')
module.exports = (function() {
	return fn = {

		//获取手机验证码
		/*
			/getVerifyCode
			{"mobile":"13359257814"}
		*/
		getVerifyCode: function(req, res) {
			var mobile = util.trim(req.body.mobile);
			if (!mobile) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};
			util.verifyCode(mobile, function(result, sixCode) {
				var Code = JSON.parse(result)
				if (!(Code.statusCode == "000000")) {
					return res.send({
						code: "6001",
						message: Code
					});
				}
				var query = {
					verifyCode: sixCode,
					serverMessage: result,
					dateCreated: new Date()
				};
				verifyModel.update({
						mobile: mobile
					}, {
						$set: query
					}, {
						upsert: true
					},
					function(err, result) {
						if (!err) {
							//console.log(sixCode)
							return res.send({
								code: "0000",
								message: 'ok',
								result: sixCode.toString()
							});
						} else {
							res.send({
								code: "6004",
								message: '保存数据错误'
							});
						}
					});
			});
		},
		/*
			/checkVerifyCode
			{
				"mobile":"13359257814",
				"verifyCode":"212128"
			}
		*/
		checkVerifyCode: function(req, res) {
			var mobile = req.body.mobile;
			var verifyCode = req.body.verifyCode;
			if (!mobile || !verifyCode) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};
			verifyModel.findOne({
				mobile: mobile,
				verifyCode: verifyCode
			}, function(err, result) {
				if (!err && !!result) {
					var seconds = util.timeInterval(result.dateCreated, new Date());
					if (seconds < 90) {
						res.send({
							code: "0000",
							message: 'ok',
							result: "",
						});
					} else {
						res.send({
							code: "6000",
							message: '验证码过期'
						});
					}
				} else {
					res.send({
						code: "6005",
						message: '验证码无效'
					});
				}
			})
		},

		//令牌学生登录
		/*
			/loginByToken
			{
				"token":"B31CD7911E3431856CBFB49B044335A0",
				"userId":"58479f6522d2d2231c6f13de"
			}
		*/
		loginByToken: function(req, res) {

			var token = req.body.token;
			var userId = req.body.userId;

			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};

			userModel.findOne({
				_id: req.body.userId
			}, function(err, result) {
				if (!err && !!result) {
					if (result.token != token) {

						return res.send({
							code: "6005",
							message: '验证失败！请重新登录',
						});
					} else {
						return res.send({
							code: "0000",
							message: 'ok',
							result: ""
						});
					}

				}
				return res.send({
					code: "6004",
					message: '无此用户'
				});
			});
		},

		/*
			学生登录
			/login
			{
				"mobile":"13359257814",
				"password":"123456",
				"deviceId":"111111"
			}
		*/
		login: function(req, res) {
			var body = req.body
			if (!body.mobile ||
				!body.deviceId ||
				!body.password) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			};
			//var preg = /^1(3|4|5|7|8)\d{9}$/;
			//var password = util.md5(body.password).toUpperCase();
			var query = {
				mobile: body.mobile,
				password: body.password
			};
			userModel.findOne(query, function(err, user) {
				if (!!user) {
					user.token = util.md5Salt(body.mobile + body.deviceId).toUpperCase();
					userModel.update({
						_id: user._id
					}, {
						$set: {
							token: user.token,
							deviceId: body.deviceId
						}
					}, function(err, result) {
						if (!err && !!result) {
							res.send({
								code: "0000",
								message: 'ok',
								result: {
									token: user.token,
									userId: user._id
								}
							});
						} else {
							res.send({
								code: "6001",
								message: '保存数据错误'
							})
						}
					});
				} else {
					return res.send({
						code: "6001",
						message: '无此用户!'
					});
				}
			});
		},

		//注册
		/*
		/register
		{
			"password":"123456",
			"deviceId":"111111",
			"mobile":"13359257814"
		}
		*/
		register: function(req, res) {
			if (!req.body.password ||
				!req.body.deviceId ||
				!req.body.mobile) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			userModel.findOne({
				mobile: req.body.mobile
			}, function(err, doc) {
				if (doc) {
					return res.send({
						code: "6003",
						message: '用户已注册',
					});
				}
				var query = {
					password: req.body.password,
					token: util.md5Salt(req.body.mobile + req.body.deviceId).toUpperCase(),
					deviceId: req.body.deviceId,
					mobile: req.body.mobile,
					lastLoginTime: new Date()
				};


				userModel.create(query, function(err, result) {
					if (result) {
						var data = {
							token: result.token,
							userId: result._id
						};
						return res.send({
							code: "0000",
							message: 'ok',
							result: data
						});

					}
					return res.send({
						code: "6001",
						message: '数据保存错误',
					});
				});

			});

		},

		//忘记密码/查询用户005
		getUserIdbyMobile: function(req, res) {
			if (!req.body.mobile) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			};
			userModel.findOne({
				mobile: req.body.mobile
			}, function(err, doc) {
				if (!err && doc) {
					return res.send({
						code: "0000",
						message: 'ok',
						result: ""
					});
				}
				return res.send({
					code: "6001",
					message: '此用户不存在',
				});
			})
		},

		/*
			忘记密码
			/forgetPassword
			{
				"mobile":"13359257814",
				"password":"111111"
			}
		*/
		forgetPassword: function(req, res) {
			var body = req.body;
			if (!body.mobile || !body.password) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			userModel.findOne({
				mobile: body.mobile
			}, function(err, result) {
				if (result) {
					if (!body.password && body.password.length < 6) {
						return res.send({
							code: "6001",
							message: '缺少参数或密码不合法'
						});
					}
					userModel.update({
						_id: result._id
					}, {
						$set: {
							password: body.password
						}
					}, function(err, result) {
						res.send({
							code: "0000",
							message: 'ok',
							result: ""
						})
					})
				} else {
					res.send({
						code: "6003",
						message: '手机号码不存在',
					});
				}
			});
		}

	}
})();