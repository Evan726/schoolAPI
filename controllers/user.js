var userModel = require('./../models/user');
var studentBasicInfoModel = require('./../models/studentBasicInfo');
var util = require('../utils/util.js');
module.exports = (function() {
	return fn = {
		//修改个人资料008
		updateUser: function(req, res) {

			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			var body = req.body;
			var allArr = ["nickName", "sex", "headImg", "birthday", "height", "weight", "admission"];
			for (var key in body) {
				if (allArr.indexOf(key) === -1) {
					return res.send({
						code: "6001",
						message: '参数错误'
					});
				}
			}
			userModel.update({
					_id: userId
				}, {
					$set: body
				},
				function(err, user) {
					if (!err && user.ok) {
						return res.send({
							code: "0000",
							message: 'ok',
							result: body
						});
					}
					return res.send({
						code: "6003",
						message: '保存失败',
						message1: err,
					});
				});

		},

		//认证校园用户009


		bindNumber: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			if (!req.body.studentNo ||
				!req.body.schoolId) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			studentBasicInfoModel.findOne({
				studentNo: req.body.studentNo,
				schoolId: req.body.schoolId
			}, function(err, student) {
				if (!err) {
					if (student) {

						userModel.update({
							_id: userId
						}, {
							$set: {
								studentNo: student.studentNo,
								schoolId: student.schoolId,
								nickName: student.nickName,
								enrollTime: new Date()
							}
						}, function(err, user) {
							if (!err && user.ok) {
								return res.send({
									code: "0000",
									message: 'ok',
									result: {
										studentNo: student.studentNo,
										schoolId: student.schoolId,
										nickName: student.nickName,
									}
								});
							}
							return res.send({
								code: "6003",
								message: '保存失败'
							});
						});
					} else {
						return res.send({
							code: "6002",
							message: '此学号不存在'
						});
					}
				} else {
					return res.send({
						code: "6003",
						message: '认证失败'
					});
				}
			});
		},

		//修改密码010
		/*
			修改密码
			/v0/editPassword?userId=58479f6522d2d2231c6f13de&token=6BEE9C276CC0DDE618C35BD4211DD52B
			{
				"password":"111111",
				"newPassWord":"222222"
			}
		*/
		editPassword: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			var body = req.body;
			if (!body.password || !body.newPassWord) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			if (body.password.length < 6 || body.newPassWord.length < 6) {
				return res.send({
					code: "6000",
					message: '缺少参数或参数不合法'
				});
			}
			if (body.password === body.newPassWord) {
				return res.send({
					code: "6000",
					message: '您最近使用过该密码'
				});
			}

			userModel.findOne({
				_id: userId,
				password: util.md5(body.password).toUpperCase()
			}, function(err, result) {
				if (!err && !!result) {
					userModel.update({
						_id: result._id
					}, {
						$set: {
							password: util.md5(body.newPassWord).toUpperCase()
						}
					}, function(err, result) {
						if (!err) {
							return res.send({
								code: "0000",
								message: 'ok',
								result: ""
							});
						} else {
							return res.send({
								code: "0000",
								message: 'ok',
								result: ""
							});
						}

					})
				} else {
					return res.send({
						code: "6002",
						message: '参数不正确'
					})
				}

			})
		}
	}
})()