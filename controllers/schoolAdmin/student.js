var util = require('../../utils/util.js');
var common = require('./common');
var userModel = require('../../models/user');
var runningCountModel = require('../../models/runningCount');
var activityMemberModel = require('../../models/activityMember');
var runningModel = require('../../models/running');

module.exports = (function() {
	var fn = {
		//学生管理107
		/*
		{
			"pageCount": 1,
			"rows": 2,
			"studentNo": "1115551111"
		}
		*/
		studentList: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				common.SemesterTime(res, user, function(dateTime, Rule) {
					var pageCount = req.body.pageCount || 1;
					var rows = req.body.rows || 20;
					var studentNo = req.body.studentNo || "";

					//console.log(user);
					//搜索用户条件
					var userQuery = {};

					if (user.group === 1) {
						if (!studentNo) {
							userQuery = {
								schoolId: user.schoolId,
							};
						} else {
							userQuery = {
								schoolId: user.schoolId,
								studentNo: {
									$regex: req.body.studentNo
								}
							};
						}
					} else {
						if (!studentNo) {
							userQuery = {
								schoolId: user.schoolId,
								clubId: {
									$in: user.clubId
								}
							};
						} else {
							userQuery = {
								schoolId: user.schoolId,
								studentNo: {
									$regex: req.body.studentNo
								},
								clubId: {
									$in: user.clubId
								}
							};
						}
					}
					var _query = userModel.find(userQuery);
					_query.skip((pageCount - 1) * rows);
					_query.limit(rows);
					_query.exec(function(err, doc) {
						if (!err) {
							//用户id 和输出的数据格式
							var resData = [];
							var userArr = []
							for (var i = 0; i < doc.length; i++) {
								// var clubName = "";
								// if (!!doc[i].clubId) {
								// 	clubName = doc[i].clubId.name
								// }
								userArr[i] = doc[i]._id;
								resData[i] = {
									studentId: doc[i]._id,
									studentNo: doc[i].studentNo || "",
									nickName: doc[i].nickName || "",
									semesterKilometerCount: 0,
									semesterCount: 0,
									semesterAchievement: 0,
									// KilometerCount: 0,
									// durationCount: 0,
									// count: 0,
									//clubName: clubName
								}
							};
							//统计总条数
							userModel.count(userQuery, function(err, count) {
								//参与的活动
								activityMemberModel.find({
									memberId: {
										$in: userArr
									},
									signType: "1",
									isEffective: "1"
								}, function(err, activityMember) {
									if (!err) {

										for (var i = 0; i < resData.length; i++) {
											for (var j = 0; j < activityMember.length; j++) {
												if (resData[i].studentId.toString() === activityMember[j].memberId.toString()) {
													if (resData[i].semesterAchievement < Rule.bigCreditActivity) {
														resData[i].semesterAchievement += Rule.creditActivity;
														resData[i].semesterCount += 1;
													}

												}
											}
										};
										if (!!doc) {
											var query = doc.map(function(element) {
												return element._id
											});
											//统计总条数 本学期的统计数据
											runningCountModel.find({
												userId: {
													$in: query
												},
												type: "3"
											}, function(err, docs) {
												if (!err) {
													if (!!docs) {
														for (var i = 0; i < resData.length; i++) {
															for (var j = 0; j < docs.length; j++) {
																if (resData[i].studentId.toString() === docs[j].userId.toString()) {
																	resData[i].semesterKilometerCount = docs[j].kilometerCount;

																	resData[i].semesterAchievement += docs[j].kilometerCount * Rule.creditKiometer;
																}
															}
														};
														return res.send({
															code: "0000",
															message: 'ok',
															result: {
																pageCount: pageCount,
																total: count,
																listData: resData
															}
														})
													} else {
														return res.send({
															code: "0000",
															message: 'ok',
															result: {
																pageCount: pageCount,
																total: count,
																listData: resData
															}
														})
													}
												}
											});
										} else {
											return res.send({
												code: "0000",
												message: 'ok',
												result: {
													pageCount: pageCount,
													total: count,
													listData: resData
												}
											})
										}
									} else {
										return res.send({
											code: "0000",
											message: 'ok',
											result: {
												pageCount: pageCount,
												total: count,
												listData: resData
											}
										})
									}
								})


							})


						} else {
							return res.send({
								code: "6001",
								message: '查询失败'
							})
						}
					});
				})
			})
		},
		//学生里程列表
		/*
		{
			"studentId": "585361565119e305f0b49c48",
			"pageCount": 1,
			"rows": 2
		}
		*/
		getMileageListByStudentId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				common.SemesterTime(res, user, function(_time, Rule) {
					var body = req.body;
					if (!body.studentId) {
						common.error(res, "6000", "缺少参数");
						return false;
					}
					var pageCount = body.pageCount || 1;
					var rows = body.rows || 20;
					runningModel.find({
						userId: body.studentId,
						isEffective: "1",
						startDate: {
							$gte: _time.startTime,
							$lt: _time.endTime
						}
					}).skip((pageCount - 1) * rows).limit(rows).exec(function(err, docs) {
						if (!err) {
							runningModel.count({
								userId: body.studentId,
								startDate: {
									$gte: _time.startTime,
									$lt: _time.endTime
								}
							}, function(err, count) {
								if (!err) {
									runningCountModel.findOne({
										userId: body.studentId,
										type: "3"
									}, function(err, runningCount) {
										if (!err) {
											var durationCount = 0,
												kilometerCount = 0;
											if (runningCount) {
												durationCount = runningCount.durationCount;
												kilometerCount = runningCount.kilometerCount;
											}
											return res.send({
												code: "0000",
												message: 'ok',
												result: {
													durationCount: durationCount,
													kilometerCount: kilometerCount,
													pageCount: pageCount,
													total: count,
													listData: docs
												}
											})
										}
										return res.send({
											code: "6003",
											message: "本学期数据失败",
										})
									})

								} else {
									return res.send({
										code: "6003",
										message: "获取总条数失败",
									})
								}

							});
						} else {
							return res.send({
								code: "6003",
								message: "查询失败"
							})
						}

					});
				})
			})
		},
		//学生活动列表
		getActivityListByStudentId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				common.SemesterTime(res, user, function(_time, Rule) {
					var body = req.body;
					if (!body.studentId) {
						common.error(res, "6000", "缺少参数");
						return false;
					}
					activityMemberModel.find({
						memberId: body.studentId,
						signTime: {
							$gte: _time.startTime,
							$lt: _time.endTime
						}
					}).populate([{
						path: 'activityId',
						select: {
							title: 1
						},
						model: "activity"
					}]).exec(function(err, docs) {
						if (!err) {
							return res.send({
								code: "0000",
								message: 'ok',
								result: {
									pageCount: 1,
									total: 1,
									listData: docs
								}
							})
						} else {
							return res.send({
								code: "6003",
								message: "查询失败"
							})
						}

					});
				})
			})
		},
		//学生的基本信息
		StudentInfo: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var body = req.body;
				if (!body.studentId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				userModel.findOne({
					_id: body.studentId,
				}, {
					password: 0,
					token: 0,
					__v: 0
				}).populate([{
					path: 'clubId',
					select: {
						name: 1
					},
					model: "clubs"
				}]).exec(function(err, docs) {
					if (!err) {
						return res.send({
							code: "0000",
							message: 'ok',
							result: docs
						})
					} else {
						return res.send({
							code: "6003",
							message: "查询失败"
						})
					}

				});
			})
		},
		/*
		删除学生
		{
			studentId: "58479f6522d2d2231c6f13de"
		}
		*/
		delStudent: function(req, res) {
			var studentId = req.body.studentId;
			if (!studentId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				userModel.update({
					_id: studentId
				}, {
					$set: {
						schoolId: null,
						clubId: null,
					}
				}, function(err, doc) {
					if (!err) {
						if (doc.ok) {
							return res.send({
								code: "0000",
								message: "ok",
								result: doc
							});
						}
						return res.send({
							code: "6003",
							message: '失败',
						});
					}
					return res.send({
						code: "6003",
						message: '缺少参数',
						message: err
					});
				});
			})
		}
	}
	return fn;
})();