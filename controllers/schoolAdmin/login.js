var util = require('../../utils/util.js');
var schoolUserModel = require('../../models/schoolUser');
module.exports = (function() {
	var fn = {
		/*
			{
				"username":"13359257814",
				"password":"123456"
			}
			*/
		login: function(req, res) {
			var body = req.body
			if (!body.username || !body.password) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			};
			//var password = util.md5(body.password).toUpperCase();
			var query = {
				username: body.username,
				password: body.password
			};
			schoolUserModel.findOne(query, function(err, user) {
				if (!err && user) {
					user.token = util.md5Salt(body.username + body.password).toUpperCase();
					schoolUserModel.update({
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
									username: user.username,
									schoolId: user.schoolId,
									clubId: user.clubId,
									nickName: user.nickName,
									group: user.group,
									newDate: new Date()
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

		}
	}
	return fn;
})();