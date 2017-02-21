var util = require('../utils/util.js')
var runningModel = require('./../models/running');
var runningNodeModel = require('./../models/runningNode')
module.exports = (function() {
	return fn = {
		//跑步结果017
		getRunning: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};

			if (!req.body.runningId) {
				return res.send({
					code: "6000",
					message: '参数错误'
				});
			}

			runningModel.findOne({
				"_id": req.body.runningId,
				state: "1"
			}, function(err, doc) {
				if (!err) {
					var data = {
						_id: doc._id,
						activityId: doc.activityId || "",
						equallySpeed: doc.equallySpeed,
						durationCount: doc.durationCount,
						kilometerCount: doc.kilometerCount,
						calorieCount: doc.calorieCount,
						lowPace: doc.lowPace,
						highPace: doc.highPace,
						userId: doc.userId,
						startDate: doc.startDate,
						endDate: doc.endDate,
						createTime: doc.createTime,
						isEffective: doc.isEffective
					};
					runningNodeModel.find({
						"runningId": doc._id
					}).sort({
						nowDate: 1
					}).exec(function(err, docs) {
						if (!err) {
							var resultData = Object.assign({}, data, {
								"runningNode": docs
							});
							return res.send({
								code: "0000",
								message: 'ok',
								result: resultData
							})
						} else {
							return res.send({
								code: "6001",
								message: '查询失败',
								result: err
							})
						}
					})
				} else {
					return res.send({
						code: "6001",
						message: '查询失败',
						result: err
					})
				}
			})


		},

		//跑步记录025
		getRunningListByDate: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			var body = req.body;
			if (!body.monthTime) {
				return res.send({
					code: "6000",
					message: '参数错误'
				});
			}
			var pageCount = body.pageCount || 1;
			var rows = body.rows || 20;

			var startTime = util.getCurrentMonthFirst(body.monthTime).data;
			var endTime = util.getCurrentMonthLast(body.monthTime).data;

			var query = {
				userId: userId,
				startDate: {
					$gte: startTime,
					$lt: endTime
				}
			};
			var _querys = runningModel.find(query, {
				kilometerCount: 1,
				durationCount: 1,
				equallySpeed: 1,
				startDate: 1,
				isEffective: 1
			});
			//_querys.skip((pageCount - 1) * rows);
			//_querys.limit(rows);
			_querys.sort({
				"startDate": -1
			});
			_querys.exec(function(err, docs) {
				if (!err) {
					runningModel.count(query, function(err, result) {
						if (!err) {

							// "_id": element._id,
							// "startDate": "2017-03-06T04:12:12.000Z",
							// "equallySpeed": 5,
							// "durationCount": 3,
							// "kilometerCount": 50

							var jsonArray = {
								pageCount: pageCount,
								rows: rows,
								total: result,
								listData: docs
							};
							res.send({
								code: "0000",
								message: "ok",
								result: jsonArray
							});
						} else {
							return res.send({
								code: "6001",
								message: '查询失败'
							})
						}

					});

				} else {
					return res.send({
						code: "6001",
						message: '查询失败'
					})
				}

			});


		}

	}
})();