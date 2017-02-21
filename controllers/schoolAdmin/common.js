var util = require('../../utils/util.js');
var schoolUserModel = require('../../models/schoolUser');
var setRuleModel = require('../../models/setRule');
var userModel = require('../../models/user');
var common = (function() {
	var fn = {
		//返回6003错误
		error: function(res, code, msg) {
			return res.send({
				code: code,
				message: msg || "查询错误"
			});
		},
		//获取学校用户的基本信息
		userVerify: function(req, res, callback) {
			var token = req.query.token;
			var userId = req.query.userId;

			if (!token || !userId) {
				fn.error(res, "6001", '缺少token或userId参数')
			};
			schoolUserModel.findOne({
				_id: userId
			}, function(err, user) {
				if (!err) {
					if (user) {
						callback(user)
					}
				}
			})
		},
		//过去本学期时间
		SemesterTime: function(res, user, callback) {
			var nowTime = new Date();
			var year = nowTime.getFullYear();
			if (!user.schoolId) {
				fn.error(res, "6003", "缺少schoolId")
			}
			setRuleModel.findOne({
				schoolId: user.schoolId
			}, function(err, Rule) {
				if (!err) {
					if (!!Rule) {
						var lastSemesterStartTime,
							lastSemesterEndTime,
							nextSemesterStartTime,
							nextSemesterEndTime;
						if (Rule.lastSemesterStartTime > nowTime.getMonth() + 1) {
							year--
						}
						if (Rule.lastSemesterStartTime < Rule.lastSemesterEntTime) {
							lastSemesterStartTime = year + "-" + Rule.lastSemesterStartTime;
							lastSemesterEndTime = year + "-" + Rule.lastSemesterEntTime;
						} else {
							lastSemesterStartTime = (year - 1) + "-" + Rule.lastSemesterStartTime;
							lastSemesterEndTime = year + "-" + Rule.lastSemesterEntTime;
						}

						if (Rule.nextSemesterStartTime < Rule.nextSemesterEndTime) {
							nextSemesterStartTime = year + "-" + Rule.nextSemesterStartTime;
							nextSemesterEndTime = year + "-" + Rule.nextSemesterEndTime;
						} else {
							nextSemesterStartTime = year + "-" + Rule.nextSemesterStartTime;
							nextSemesterEndTime = (year + 1) + "-" + Rule.nextSemesterEndTime;
						}


						// console.log(Rule);
						// console.log(lastSemesterStartTime);
						// console.log(lastSemesterEndTime);
						// console.log(nextSemesterStartTime);
						// console.log(nextSemesterEndTime);
						var startTime = "",
							endTime = "";
						if (new Date() > new Date(lastSemesterStartTime + "-1") && new Date() < new Date(nextSemesterStartTime + "-1")) {
							startTime = lastSemesterStartTime;
							endTime = lastSemesterEndTime;
						} else {
							startTime = nextSemesterStartTime;
							endTime = nextSemesterEndTime;
						};

						var _time = {
							startTime: util.getCurrentMonthFirst(startTime).data,
							endTime: util.getCurrentMonthLast(endTime).data
						};
						callback(_time, Rule)
					} else {
						return res.send({
							code: "6001",
							message: '请设置学期月份'
						});
					}
				} else {
					return res.send({
						code: "6001",
						message: '请设置学期月份'
					});
				}
			})
		},

		//获取学生信息
		getStudentInfo: function(res, studentId, callback) {
			if (!studentId) {
				fn.error(res, "6001", "缺少studentId参数")
			};
			userModel.findOne({
				_id: studentId
			}, function(err, user) {
				if (!err) {
					callback(res, user)
				} else {
					fn.error(res, "6003")
				}
			})
		}
	};
	return fn;
})();

module.exports = common;