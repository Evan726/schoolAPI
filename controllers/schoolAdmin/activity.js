var util = require('../../utils/util.js');
var common = require('./common');
var clubModel = require('../../models/club');
var schoolUserModel = require('../../models/schoolUser');
var activityModel = require('../../models/activity');
var activityMemberModel = require('../../models/activityMember');
var runningCountModel = require('../../models/runningCount');
var runningModel = require('../../models/running');
var userModel = require('../../models/user');
var mongoose = require("mongoose");
module.exports = (function() {
	var fn = {
		//活动列表
		/*
		{
			"pageCount": 1,
			"rows": 2,
			"memberType": 0,
			"title":"11",
			"activityType":0,
			"status":0   
		}
state-1：报名中 2进行中 3已完成
activityType：  0跑步 1其他
		*/
		getActivityList: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;

				var reqQuery = {};
				//console.log(user)
				if (user.group == 2) {
					reqQuery = {
						schoolId: user.schoolId,
						clubId: {
							$in: user.clubId
						}
					};
				} else if (user.group == 1) {
					reqQuery = {
						schoolId: user.schoolId
					};
				}

				if (req.body.title) {
					reqQuery.title = {
						$regex: req.body.title,
					}
				};

				if (Number(req.body.memberType) >= 0) {
					reqQuery.memberType = req.body.memberType
				};

				if (Number(req.body.activityType) >= 0) {
					reqQuery.activityType = req.body.activityType
				};

				if (req.body.status >= 0) {
					if (req.body.status == 0) {
						reqQuery.startDate = {
							$gt: new Date()
						}
					} else if (req.body.status == 1) {
						reqQuery.startDate = {
							$lt: new Date()
						}
						reqQuery.endDate = {
							$gt: new Date()
						}
					} else if (req.body.status == 2) {
						reqQuery.endDate = {
							$lt: new Date()
						};
					}
				};

				var _query = activityModel.find(reqQuery).sort({
					_id: -1
				});
				_query.populate([{
					path: 'clubId',
					select: {
						name: 1
					},
					model: "clubs"
				}]);
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, docs) {
					if (!err) {
						var resultJson = [];
						var resJson = [];
						//console.log("docs", docs)
						for (var i = 0; i < docs.length; i++) {
							var nickName = "";
							if (docs[i].adminId) {
								nickName = docs[i].adminId.nickName
							}
							var clubName = "",
								clubId = "";
							if (docs[i].clubId) {
								clubName = docs[i].clubId.name;
								clubId = docs[i].clubId._id;
							}

							resJson[i] = docs[i]._id;
							resultJson[i] = {
								_id: docs[i]._id,
								schoolId: docs[i].schoolId,
								clubId: clubId,
								clubName: clubName,
								title: docs[i].title,
								introductionUrl: docs[i].introductionUrl,
								enrollCount: 0,
								signCount: 0,
								startDate: docs[i].startDate,
								endDate: docs[i].endDate,
								address: docs[i].createTime,
								memberType: docs[i].memberType,
								logoImgUrl: docs[i].logoImgUrl,
								activityType: docs[i].activityType,
								publisher: docs[i].publisher,
								newDate: new Date()
							}
						}
						activityModel.count(reqQuery, function(err, count) {
							if (!count) {
								var count = 0
							}
							activityMemberModel.find({
								activityId: {
									$in: resJson
								}
							}, function(err, member) {

								if (!err) {
									if (!member) {
										return res.send({
											code: "0000",
											message: "ok",
											result: {
												pageCount: pageCount,
												total: count,
												listData: resultJson
											}
										})
									}
									for (var i = 0; i < resultJson.length; i++) {
										for (var j = 0; j < member.length; j++) {
											if (resultJson[i]._id.toString() === member[j].activityId.toString()) {
												resultJson[i].enrollCount += 1
												if (member[j].signType === "1") {
													resultJson[i].signCount += 1
												}
											}

										}
									}
									return res.send({
										code: "0000",
										message: "ok",
										result: {
											pageCount: pageCount,
											total: count,
											listData: resultJson
										}
									})
								} else {
									common.error(res, "6000", "查询成员失败");
									return false
								}
							})


						});

					} else {
						common.error(res, "6003", "查询失败");
						return false
					}
				})
			})
		},
		//发布活动
		/*
			{
			    "title": "后台发布的活动",
			    "introductionUrl": "http://www.luckrun.com",
			    "startDate": "2017-01-02 12:00",
			    "endDate": "2017-01-15 12:00",
			    "address": "陕西西安大明宫",
			    "kilometer": 20,
			    "peopleNumber": 500,
			    "publisher": "发布者名称",
			    "logoImgUrl": "http://7xrezq.com1.z0.glb.clouddn.com/o_1b257b3udmbhhln1tnannkdab11.jpg",
			    "activityType": "0",
			    "memberType": "0",
			    "clubId": "585b3940055aab06641b9379"
			}
		*/

		addActivity: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var body = req.body;
				if (!body.title ||
					!body.startDate ||
					!body.endDate ||
					!body.address ||
					!body.kilometer ||
					!body.peopleNumber ||
					!body.publisher ||
					!body.memberType ||
					!body.activityType ||
					!body.clubId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				if (!typeof body.kilometer == "number" ||
					!typeof body.peopleNumber == "number") {
					common.error(res, "6000", "参数值类型错误");
					return false
				}

				var query = {
					schoolId: user.schoolId,
					title: body.title,
					introductionUrl: body.introductionUrl || "",
					startDate: new Date(body.startDate),
					endDate: new Date(body.endDate),
					address: body.address,
					kilometer: body.kilometer,
					peopleNumber: body.peopleNumber,
					publisher: body.publisher,
					signEndDate: body.signEndDate,
					memberType: body.memberType,
					clubId: body.clubId,
					logoImgUrl: body.logoImgUrl,
					activityType: body.activityType,
					"lat": body.lat,
					"lag": body.lag,
					isSign: body.isSign || "1",
					isEnroll: body.isEnroll || "1",
					isPay: body.isPay || "0",
					totalFee: body.totalFee || 0
				}

				activityModel.create(query, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: doc
						});
					} else {
						return res.send({
							code: "6003",
							message: "新增失败"
						});
					}
				})
			})
		},
		//删除活动
		delActivity: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (!req.body.activityId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				activityModel.remove({
					_id: req.body.activityId,
					endDate: {
						$lt: new Date
					}
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: {
								activityId: req.body.activityId
							}
						});
					} else {
						common.error(res, "6003", "删除失败");
						return false
					}
				})
			})
		},
		//活动详情
		activityDetails: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (!req.body.activityId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				if (!req.body.activityId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				activityModel.findOne({
					_id: req.body.activityId
				}).populate({
					path: "clubId",
					select: {
						name: 1
					},
					model: "clubs"
				}).exec(function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: doc
						});
					} else {
						common.error(res, "6003", "查询失败");
						return false
					}
				})
			})
		},
		//活动成员
		activityMemberByActivityId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (!req.body.activityId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				if (!req.body.activityId) {
					common.error(res, "6000", "缺少参数");
					return false
				}
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = activityMemberModel.find({
					activityId: req.body.activityId
				});
				_query.populate([{
					path: 'memberId',
					select: {
						nickName: 1,
						studentNo: 1
					},
					model: "user"
				}]);
				_query.sort({
					signTime: -1
				});
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {
						activityMemberModel.count({
							activityId: req.body.activityId
						}, function(err, count) {
							if (!err) {
								var resultData = [];
								var activityIdArr = [];
								for (var i = 0; i < doc.length; i++) {
									activityIdArr[i] = doc[i].activityId;
									resultData[i] = {
										id: doc[i]._id,
										activityId: doc[i].activityId,
										enrollTime: doc[i].enrollTime,
										memberId: doc[i].memberId,
										signTime: doc[i].signTime,
										signType: doc[i].signType,
										kilometer: 0,
										signAddress: doc[i].signAddress
									}
								}
								runningModel.find({
									activityId: {
										$in: activityIdArr
									}
								}, {
									kilometerCount: 1,
									activityId: 1
								}, function(err, kilometerArr) {
									if (!err) {
										for (var i = 0; i < resultData.length; i++) {
											for (var j = 0; j < kilometerArr.length; j++) {
												if (resultData[i].activityId.toString() === kilometerArr[j].activityId.toString()) {
													resultData[i].kilometer = kilometerArr[j].kilometerCount
												}
											}
										}
										return res.send({
											code: "0000",
											message: "ok",
											result: {
												pageCount: pageCount,
												total: count,
												listData: resultData
											}
										});
									} else {
										return res.send({
											code: "0000",
											message: "ok",
											result: {
												pageCount: pageCount,
												total: count,
												listData: resultData
											}
										});
									}
								})
							} else {
								common.error(res, "6003", "查询失败");
								return false
							}
						})


					} else {
						common.error(res, "6003", "查询失败");
						return false
					}
				})
			})
		}

	}
	return fn;
})();