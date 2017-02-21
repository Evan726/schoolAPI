var clubMobel = require("./../models/club");
var userModel = require('./../models/user');

module.exports = (function() {
	return fn = {
		//测试多表查询
		// getClubList: function(req, res) {
		// 	clubMobel.findOne({
		// 		_id: "5853bdabe6c92c1e9429e98d"
		// 	}).populate('schoolId').exec(function(err, doc) {
		// 		if (!err && !!doc) {
		// 			res.send({
		// 				code: "0000",
		// 				message: "ok",
		// 				result1: doc
		// 			});
		// 		}
		// 		return res.send({
		// 			code: "6001",
		// 			message: '查询失败'
		// 		})
		// 	});
		// },


		//查询俱乐部列表013
		getClubList: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			if (!req.body.schoolID) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			clubMobel.find({
				schoolId: req.body.schoolID
			}, {
				name: 1,
				clubNo: 1
			}, function(err, doc) {
				if (!err) {
					return res.send({
						code: "0000",
						message: "ok",
						result: doc
					});
				}
				return res.send({
					code: "6001",
					message: '查询失败'
				})
			})
		},

		//创建俱乐部014
		// createClub: function(req, res) {
		// 	var token = req.query.token;
		// 	var userId = req.query.userId;
		// 	if (!token || !userId) {
		// 		return res.send({
		// 			code: "6001",
		// 			message: '缺少token或userId参数'
		// 		});
		// 	};

		// 	if (!req.body.schoolId ||
		// 		!req.body.clubNo ||
		// 		!req.body.name) {
		// 		return res.send({
		// 			code: "6000",
		// 			message: '缺少参数'
		// 		});
		// 	}

		// 	clubMobel.create({
		// 		schoolId: req.body.schoolId,
		// 		clubNo: req.body.clubNo,
		// 		name: req.body.name
		// 	}, function(err, doc) {
		// 		if (!err && !!doc) {
		// 			res.send({
		// 				code: "0000",
		// 				message: "ok",
		// 				result: doc
		// 			});
		// 		}
		// 		return res.send({
		// 			code: "6001",
		// 			message: '新增失败'
		// 		})
		// 	})
		// },

		//绑定俱乐部015
		bindClub: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			if (!req.body.clubID) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}
			userModel.update({
				_id: req.query.userId
			}, {
				$set: {
					clubId: req.body.clubID
				}
			}, function(err, doc) {
				if (!err) {
					return res.send({
						code: "0000",
						message: "ok",
						result: {
							clubId: req.body.clubID
						}
					});
				}
				return res.send({
					code: "6001",
					message: '绑定失败'
				})
			});
		}
	}
})();