var activityModel = require('./../models/activity');
var activityMemberModel = require('./../models/activityMember');

module.exports = (function() {
	return fn = {
		//创建活动026 
		creatActivity: function(req, res) {
			return res.send({
				code: "6001",
				message: '无此接口'
			});
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};

			var body = req.body;

			if (!body.title ||
				!body.introductionUrl ||
				!body.startDate ||
				!body.endDate ||
				!body.address ||
				!body.kilometer ||
				!body.peopleNumber ||
				!body.publisher ||
				!body.signEndDate ||
				!body.memberType ||
				!body.clubId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			}
			if (!typeof body.startDate == "string" ||
				!typeof body.endDate == "string" ||
				!typeof body.kilometer == "number" ||
				!typeof body.peopleNumber == "number" ||
				!typeof body.signEndDate == "string") {
				return res.send({
					code: "6000",
					message: '参数值类型错误'
				});
			}

			var query = {
				title: body.title,
				introductionUrl: body.introductionUrl,
				startDate: body.startDate,
				endDate: body.endDate,
				address: body.address,
				kilometer: body.kilometer,
				peopleNumber: body.peopleNumber,
				publisher: body.publisher,
				signEndDate: body.signEndDate,
				memberType: body.memberType,
				clubId: body.clubId,
				logoImgUrl: body.logoImgUrl,
				activityType: body.activityType,
				isSign: body.isSign || "1",
				isEnroll: body.isEnroll || "1",
				isPay: body.isPay || "0",
				totalFee: body.totalFee || 0
			}

			activityModel.create(query, function(err, doc) {
				if (!err) {
					res.send({
						code: "0000",
						message: "ok",
						result: doc._id
					});
				} else {
					return res.send({
						code: "6002",
						message: '新增失败',
						result: err
					})
				}
			})

		},

		//删除活动027
		delActivity: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};

			var body = req.body;

			if (!body.activityId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			}

			activityModel.remove({
				_id: body.activityId
			}, function(err, doc) {
				if (!err) {
					res.send({
						code: "0000",
						message: "ok",
						result: ""
					});
				} else {
					return res.send({
						code: "6002",
						message: '删除失败',
						result: err
					})
				}
			});

		},

		//修改活动028
		updateActivity: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			var body = req.body;

			if (!body.activityId ||
				!body.title ||
				!body.introductionUrl ||
				!body.startDate ||
				!body.endDate ||
				!body.address ||
				!body.kilometer ||
				!body.peopleNumber ||
				!body.publisher ||
				!body.signEndDate ||
				!body.memberType ||
				!body.clubId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			}
			if (!typeof body.startDate == "string" ||
				!typeof body.endDate == "string" ||
				!typeof body.kilometer == "number" ||
				!typeof body.peopleNumber == "number" ||
				!typeof body.signEndDate == "string") {
				return res.send({
					code: "6000",
					message: '参数值类型错误'
				});
			}

			var query = {
				title: body.title,
				introductionUrl: body.introductionUrl,
				startDate: body.startDate,
				endDate: body.endDate,
				address: body.address,
				kilometer: body.kilometer,
				peopleNumber: body.peopleNumber,
				publisher: body.publisher,
				signEndDate: body.signEndDate,
				memberType: body.memberType,
				clubId: body.clubId,
				logoImgUrl: body.logoImgUrl,
				activityType: body.activityType,
				isSign: body.isSign || "1",
				isEnroll: body.isEnroll || "1",
				isPay: body.isPay || "0",
				totalFee: body.totalFee || 0
			};

			activityModel.update({
					_id: body.activityId
				}, {
					$set: query
				},
				function(err, doc) {
					if (!err) {
						res.send({
							code: "0000",
							message: "ok",
							result: doc._id
						});
					} else {
						return res.send({
							code: "6002",
							message: '修改失败',
							result: err
						})
					}
				})
		},



		//活动报名029
		enroller: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};

			var body = req.body;

			if (!body.activityId || !body.signType) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};

			activityModel.findOne({
				_id: body.activityId
			}, function(err, activity) {
				if (!err) {
					if (body.signType === "0") {
						activityMemberModel.findOne({
							activityId: activity._id,
							memberId: userId,
							signType: body.signType
						}, function(err, length) {
							if (!err) {
								if (!length) {
									activityMemberModel.create({
										activityId: activity._id,
										memberId: userId,
										enrollTime: new Date()
									}, function(err, doc) {
										if (!err) {
											//console.log("-------doc---------", doc);
											activityModel.update({
												_id: body.activityId
											}, {
												enrollCount: activity.enrollCount + 1
											}, function(err, update) {
												if (!err) {
													return res.send({
														code: "0000",
														message: "ok",
														result: ""
													});
												}
											})
										} else {
											return res.send({
												code: "6001",
												message: '报名失败',
												result: err
											});
										}
									});
								} else {
									return res.send({
										code: "0002",
										message: '已经报过名了',
										result: ""
									});
								}
							} else {
								return res.send({
									code: "6003",
									message: '失败'
								});
							}
						});



					} else if (body.signType === "1") {
						activityMemberModel.update({
							activityId: activity._id,
							memberId: userId,
							signType: "0"
						}, {
							$set: {
								signAddress: body.signAddress || "",
								signType: body.signType,
								signTime: new Date()
							}
						}, function(err, docs) {
							if (!err) {
								if (docs.n === 1) {
									if (!err) {
										activityModel.update({
											_id: body.activityId
										}, {
											signCount: activity.signCount + 1
										}, function(err, update) {
											if (!err) {
												return res.send({
													code: "0000",
													message: "ok",
													result: ""
												});
											}
										})
									} else {
										return res.send({
											code: "6001",
											message: '报名失败',
											result: err
										});
									}
								} else {
									res.send({
										code: "6001",
										message: "打过卡了"
									});
								}

							} else {
								return res.send({
									code: "6001",
									message: '打卡失败',
									result: err
								});
							}

						});

					} else {
						return res.send({
							code: "6001",
							message: '参数不正确'
						});
					}

				} else {
					return res.send({
						code: "6002",
						message: '没有此活动',
						result: err
					})
				}
			});



		}
	}
})();