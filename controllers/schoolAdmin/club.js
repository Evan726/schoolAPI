var util = require('../../utils/util.js');
var common = require('./common');
var clubModel = require('../../models/club');
var schoolUserModel = require('../../models/schoolUser');
var activityModel = require('../../models/activity');
var activityMemberModel = require('../../models/activityMember');
var runningCountModel = require('../../models/runningCount');
var userModel = require('../../models/user');
var mongoose = require("mongoose");
module.exports = (function() {
	var fn = {
		//俱乐部列表
		getClubList: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				common.SemesterTime(res, user, function(dateTime, Rule) {
					// if (user.group !== 1) {
					// 	common.error(res, "6000", "没有权限");
					//return false;
					// };
					var pageCount = req.body.pageCount || 1;
					var rows = req.body.rows || 20;

					var queryName = req.body.queryName;
					var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");

					var queryJson = {
						schoolId: user.schoolId,
					}
					if (user.group == 2) {
						queryJson._id = {
							$in: user.clubId
						};
					}
					if (queryName) {
						//有汉字，则是名称 否则是编号
						if (reg.test(queryName)) {
							queryJson.name = {
								$regex: queryName
							};
						} else {
							queryJson.clubNo = {
								$regex: queryName
							};
						}
					}

					//console.log("queryJson:", queryJson)

					var _query = clubModel.find(queryJson);
					_query.sort({
						_id: -1
					});
					_query.populate([{
						path: 'adminId',
						select: {
							nickName: 1
						},
						model: "schoolUser"
					}]);
					_query.skip((pageCount - 1) * rows);
					_query.limit(rows);
					_query.exec(function(err, doc) {
						if (!err) {
							clubModel.count(queryJson, function(err, count) {
								var resultJson = [];
								var resJson = [];
								for (var i = 0; i < doc.length; i++) {
									var nickName = "";
									if (doc[i].adminId) {
										nickName = doc[i].adminId.nickName
									}
									resJson[i] = doc[i]._id;
									resultJson[i] = {
										_id: doc[i]._id,
										schoolId: doc[i].schoolId,
										clubNo: doc[i].clubNo,
										name: doc[i].name,
										logo: doc[i].logo,
										adminName: nickName,
										memberCount: 0,
										activityCount: 0,
										createTime: doc[i].createTime
									}
								}
								activityModel.find({
									schoolId: user.schoolId,
									clubId: {
										$in: resJson
									}
								}, function(err, activityCount) {

									for (var i = 0; i < resultJson.length; i++) {
										for (var j = 0; j < activityCount.length; j++) {
											if (resultJson[i]._id.toString() === activityCount[j].clubId.toString()) {
												resultJson[i].activityCount++;
											}
										}

									}
									userModel.find({
										schoolId: user.schoolId,
										clubId: {
											$in: resJson
										}
									}, function(err, act) {
										for (var i = 0; i < resultJson.length; i++) {
											for (var j = 0; j < act.length; j++) {
												if (resultJson[i]._id.toString() === act[j].clubId.toString()) {
													resultJson[i].memberCount++;
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
									})
								});
							});



						} else {
							common.error(res, "6003", "查询错误");
							return false;
						}
					})
				})
			})
		},
		//俱乐部信息
		/*
			{
				"clubId":"586c60fe27b1ea0bb084da9e"
			}
		*/
		getClubInfoById: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (!req.body.clubId) {
					return res.send({
						code: "6000",
						message: '缺少参数'
					});
				}
				clubModel.findOne({
					_id: req.body.clubId
				}).populate([{
					path: 'adminId',
					select: {
						nickName: 1
					},
					model: "schoolUser"
				}]).exec(function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: doc
						})
					} else {
						common.error(res, "6003", "查询失败");
						return false;
					}
				})
			})
		},
		//发布俱乐部
		/*
			{
					
					"adminId": "58660dd379b8580aecacc14a",
					"logo": "",
					"clubNo": "C1",
					"name": "测试c1",
					"content": "这是一个测试介绍",
			}
		*/
		addClub: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (user.group !== 1) {
					return res.send({
						code: "6000",
						message: '你的权限不够'
					});
				}
				if (!req.body.clubNo ||
					!req.body.adminId ||
					!req.body.name) {
					return res.send({
						code: "6000",
						message: '缺少参数'
					});
				}
				clubModel.create({
					schoolId: user.schoolId,
					adminId: req.body.adminId,
					logo: req.body.logo || "",
					clubNo: req.body.clubNo,
					name: req.body.name,
					content: req.body.content || "",
				}, function(err, doc) {
					if (!err) {

						schoolUserModel.update({
							_id: req.body.adminId
						}, {
							$push: {
								clubId: doc._id
							}
						}, function(err, update) {
							if (!err) {
								schoolUserModel.findOne({
									_id: req.body.adminId
								}, {
									nickName: 1,
									_id: 0
								}, function(err, schoolUser) {
									if (!err) {
										var nickName = "";
										if (!!schoolUser) {
											nickName = schoolUser.nickName;
										}
										return res.send({
											code: "0000",
											message: "ok",
											result1: schoolUser,
											result: {
												"schoolId": doc.schoolId,
												"adminId": doc.adminId,
												"logo": doc.logo,
												"clubNo": doc.clubNo,
												"name": doc.name,
												"content": doc.content,
												"_id": doc._id,
												"nickName": nickName,
												"createTime": doc.createTime
											}
										});
									} else {
										return res.send({
											code: "6001",
											message: '新增失败'
										})
									}
								})

							} else {
								clubModel.remove({
									_id: doc._id
								});
								return res.send({
									code: "6001",
									message: '新增失败'
								})
							}
						});
					} else {
						return res.send({
							code: "6001",
							message: '新增失败'
						})
					}
				})
			})
		},
		//编辑俱乐部

		editClub: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (user.group !== 1) {
					return res.send({
						code: "6000",
						message: '你的权限不够'
					});
				}
				if (!req.body.clubId || !req.body.adminId) {
					return res.send({
						code: "6000",
						message: '缺少参数'
					});
				}
				schoolUserModel.findOne({
					clubId: mongoose.Types.ObjectId(req.body.clubId)
				}, function(err, schoolUser) {
					if (!err) {
						clubModel.update({
							schoolId: user.schoolId,
							_id: req.body.clubId
						}, {
							adminId: req.body.adminId,
							logo: req.body.logo || "",
							content: req.body.content || "",
						}, function(err, doc) {
							if (!err) {
								if (!!schoolUser) {
									if (req.body.adminId.toString() === schoolUser._id.toString()) {
										return res.send({
											code: "0000",
											message: "ok",
											result: {
												"id": req.body.clubId,
												"adminId": req.body.adminId,
												"logo": req.body.logo,
												"content": req.body.content,
											}
										});
									} else {
										schoolUserModel.update({
											_id: schoolUser._id
										}, {
											$pull: {
												clubId: mongoose.Types.ObjectId(req.body.clubId)
											}
										}, {
											multi: true
										}, function(err, fff) {
											schoolUserModel.update({
												_id: req.body.adminId,
											}, {
												$push: {
													clubId: mongoose.Types.ObjectId(req.body.clubId)
												}
											}, function(err, update) {
												if (!err) {
													res.send({
														code: "00010",
														message: "ok",
														result: {
															"id": req.body.clubId,
															"adminId": req.body.adminId,
															"logo": req.body.logo,
															"content": req.body.content,
														}
													});
												} else {
													return res.send({
														code: "6002",
														message: '更新用户失败'
													})
												}
											});
										});
									}
								} else {
									schoolUserModel.update({
										_id: req.body.adminId,
									}, {
										$push: {
											clubId: mongoose.Types.ObjectId(req.body.clubId)
										}
									}, function(err, update) {
										if (!err) {
											res.send({
												code: "00001",
												message: "ok",
												result: {
													"id": req.body.clubId,
													"adminId": req.body.adminId,
													"logo": req.body.logo,
													"content": req.body.content,
												}
											});
										} else {
											return res.send({
												code: "60011",
												message: '更新用户失败'
											})
										}
									});
								}
							} else {
								return res.send({
									code: "6001",
									message: '新增失败'
								})
							}
						})
					} else {
						common.error(res, "6003", "更新失败");;
						return false;
					}

				})
			})
		},
		//{"clubId":"587f32c9f167340f80e4b450"}
		delClub: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				if (user.group !== 1) {
					common.error(res, "6000", "没有权限");
					return false;
				};
				var body = req.body;
				if (!body.clubId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				clubModel.remove({
					_id: body.clubId,
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: {
								clubId: body.clubId
							}
						})
					} else {
						common.error(res, "6003", "失败");
						return false;
					}
				})
			})
		},
		//获取俱乐部活动
		getClubActivityByClubId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				if (!req.body.clubId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				var _query = activityModel.find({
					schoolId: user.schoolId,
					clubId: req.body.clubId
				});
				// _query.populate([{
				// 	path: 'adminId',
				// 	select: {
				// 		nickName: 1
				// 	},
				// 	model: "schoolUser"
				// }]);
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, docs) {
					if (!err) {

						var resultJson = [];
						var resJson = [];
						for (var i = 0; i < docs.length; i++) {
							var nickName = "";
							if (docs[i].adminId) {
								nickName = docs[i].adminId.nickName
							}
							resJson[i] = docs[i]._id;
							resultJson[i] = {
								_id: docs[i]._id,
								schoolId: docs[i].schoolId,
								clubId: docs[i].clubId,
								title: docs[i].title,
								introductionUrl: docs[i].introductionUrl,
								enrollCount: 0,
								signCount: 0,
								startDate: docs[i].startDate,
								endDate: docs[i].endDate,
								address: docs[i].address,
								memberType: docs[i].memberType,
								logoImgUrl: docs[i].logoImgUrl,
								activityType: docs[i].activityType,
								publisher: docs[i].publisher,
								newDate: new Date()
							}
						}
						activityModel.count({
							schoolId: user.schoolId,
							clubId: req.body.clubId
						}, function(err, count) {
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
									return false;
								}
							})


						});

					} else {
						common.error(res, "6003", "查询失败");
						return false;
					}
				})
			})
		},
		//移除俱乐部成员
		delClubMemberById: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!req.body.userId) {
					return res.send({
						code: "60000",
						message: '缺少参数'
					});
				}
				userModel.update({
					_id: req.body.userId
				}, {
					"$unset": {
						clubId: true
					}
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: {
								clubId: req.body.userId
							}
						});
					}
					return res.send({
						code: "6001",
						message: '移除失败'
					})
				});
			})
		},
		//获取俱乐部成员
		getClubMemberByClubId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				common.SemesterTime(res, user, function(_time, Rule) {
					var pageCount = req.body.pageCount || 1;
					var rows = req.body.rows || 20;
					if (!req.body.clubId) {
						common.error(res, "6000", "缺少参数");
						return false;
					}
					var _query = userModel.find({
						schoolId: user.schoolId,
						clubId: req.body.clubId
					});
					_query.skip((pageCount - 1) * rows);
					_query.limit(rows);
					_query.exec(function(err, docs) {
						if (!err) {
							var resultJson = [];
							var resJson = [];
							for (var i = 0; i < docs.length; i++) {
								var nickName = "";
								if (docs[i].adminId) {
									nickName = docs[i].adminId.nickName
								}
								resJson[i] = docs[i]._id;
								resultJson[i] = {
									_id: docs[i]._id,
									studentNo: docs[i].studentNo,
									nickName: docs[i].nickName,
									title: docs[i].title,
									enrollTime: docs[i].enrollTime,
									kilometerCount: 0,
									activityCount: 0
								}
							}
							userModel.count({
								schoolId: user.schoolId,
								clubId: req.body.clubId
							}, function(err, count) {
								if (!count) {
									var count = 0
								}
								activityMemberModel.find({
									memberId: {
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

												if (resultJson[i]._id.toString() === member[j].memberId.toString()) {
													resultJson[i].activityCount += 1
												}

											}
										}
										runningCountModel.find({
											userId: {
												$in: resJson
											},
											countTime: {
												$gte: _time.startTime,
												$lt: _time.endTime
											},
											type: "3"
										}, function(err, runningCount) {
											for (var i = 0; i < resultJson.length; i++) {
												for (var j = 0; j < runningCount.length; j++) {
													if (resultJson[i]._id.toString() === runningCount[j].userId.toString()) {
														resultJson[i].kilometerCount = runningCount[j].kilometerCount
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
										})

									} else {
										common.error(res, "6000", "查询成员失败");
										return false;
									}
								})


							});

						} else {
							common.error(res, "6003", "查询失败");
							return false;
						}
					})
				})
			})
		}

	}
	return fn;
})();