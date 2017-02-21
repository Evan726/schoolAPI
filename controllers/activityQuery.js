var activityModel = require('./../models/activity');
var activityMemberModel = require('./../models/activityMember');
var runningCountModel = require('./../models/runningCount');
var userModel = require('./../models/user');
module.exports = (function() {

	return fn = {
		//活动列表031
		listActivitys: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: "6001",
					message: '缺少token或userId参数'
				});
			};
			var body = req.body;
			if (!body.type) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}

			var pageCount = body.pageCount || 1;
			var rows = body.rows || 20;

			if (!typeof body.type == "string" ||
				!typeof pageCount == "number" ||
				!typeof rows == "number") {
				return res.send({
					code: "6000",
					message: '参数值类型错误'
				});
			}

			//定义请求参数
			var query = {};
			//定义返回字段
			var projection = {
				clubName: 1,
				memberType: 1,
				logoImgUrl: 1,
				title: 1,
				startDate: 1,
				endDate: 1,
				peopleNumber: 1,
				enrollCount: 1,
				signCount: 1,
				clubId: 1
			};
			if (body.type === "0") {
				query = {
					memberId: userId
				}
				var _querys = activityMemberModel.find(query, {
					activityId: 1,
					_id: 0
				});
				_querys.skip((pageCount - 1) * rows);
				_querys.limit(rows);
				_querys.exec(function(err, docs) {
					if (!err) {
						activityMemberModel.count(query, function(err, count) {
							if (!err) {
								var queryArr = [];
								for (var i = 0; i < docs.length; i++) {
									queryArr[i] = docs[i].activityId
								}
								query = {
									_id: {
										$in: queryArr
									}
								};
								_query(query, count);
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
			} else if (body.type === "1") {
				userModel.findOne({
					_id: userId
				}, function(err, doc) {
					if (!err) {
						if (doc.clubId) {
							query = {
								$or: [{
									memberType: 0,
									clubId: doc.clubId
								}, {
									memberType: 1
								}]
							};
							_query(query);
						} else {
							query = {
								memberType: 1
							};
							_query(query);
						}

					} else {
						return res.send({
							code: "6004",
							message: "查询失败"
						});
					}
				});
				// query = {
				// 	memberType: {
				// 		$in: [0, 1]
				// 	}
				// };
				// _query(query);
			} else if (body.type === "2") {
				query = {
					memberType: body.type
				};
				_query(query);
			} else {
				return res.send({
					code: "6000",
					message: '参数不正确'
				});
			}

			//查新校外活动列表

			function _query(query, count) {
				var querys = activityModel.find(query, projection);
				querys.populate([{
					path: 'clubId',
					select: {
						name: 1,
						clubNo: 1
					},
					model: "clubs"
				}]);
				querys.skip((pageCount - 1) * rows);
				querys.limit(rows);
				querys.sort({
					memberType: 1,
					startDate: -1
				});
				//计算分页数据
				querys.exec(function(err, docs) {
					if (!err) {
						//计算数据总数
						activityModel.count(query, function(err, result) {
							if (!err) {
								var _clubId = "";
								var _clubName = "";

								var arr = [];
								for (var i = 0; i < docs.length; i++) {
									if (docs[i].clubId) {
										_clubId = docs[i].clubId._id;
										_clubName = docs[i].clubId.name;
									}
									arr[i] = {
										id: docs[i]._id,
										title: docs[i].title,
										startDate: docs[i].startDate,
										endDate: docs[i].endDate,
										startDate: docs[i].startDate,
										peopleNumber: docs[i].peopleNumber,
										enrollCount: docs[i].enrollCount || 0,
										signCount: docs[i].signCount || 0,
										memberType: docs[i].memberType,
										logoImgUrl: docs[i].logoImgUrl,
										clubId: _clubId,
										clubName: _clubName,
										newDate: new Date()
									}
								}



								var jsonArray = {
									pageCount: pageCount,
									total: !!count ? count : result,
									listData: arr
								};
								return res.send({
									code: "0000",
									message: "ok",
									result: jsonArray
								});
							} else {
								return res.send({
									code: "6002",
									message: '查询失败',
									result: err
								})
							}
						});
					} else {
						return res.send({
							code: "6002",
							message: '查询失败',
							result: err
						})
					}
				});
			}

		},

		//活动详情032
		getActivity: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			var activityId = req.body.activityId;
			if (!token || !userId || !activityId) {
				return res.send({
					code: "6001",
					message: '缺少参数'
				});
			};

			var query = activityModel.findOne({
				_id: activityId
			}, {
				title: 1,
				introductionUrl: 1,
				startDate: 1,
				endDate: 1,
				address: 1,
				kilometer: 1,
				peopleNumber: 1,
				publisher: 1,
				logoImgUrl: 1,
				activityType: 1,
				signEndDate: 1,
				memberType: 1,
				enrollCount: 1,
				signCount: 1,
				lat: 1,
				lag: 1,
				clubId: 1
			}).populate([{
				path: 'clubId',
				select: {
					name: 1,
					clubNo: 1
				},
				model: "clubs"
			}]);
			query.exec(function(err, doc) {
				if (!err) {
					activityMemberModel.findOne({
						activityId: activityId,
						memberId: userId
					}, function(err, menber) {
						if (!err) {
							if (!menber) {
								signType = "0"
							} else {
								if (menber.signType === "1") {
									signType = "2"
								} else {
									signType = "1"
								}
							}
							return res.send({
								code: "0000",
								message: "ok",
								result: {
									"_id": doc._id,
									"title": doc.title,
									"introductionUrl": doc.introductionUrl,
									"startDate": doc.startDate,
									"endDate": doc.endDate,
									"address": doc.address,
									"kilometer": doc.kilometer,
									"peopleNumber": doc.peopleNumber,
									"publisher": doc.publisher,
									"signEndDate": doc.signEndDate,
									"memberType": doc.memberType,
									"logoImgUrl": doc.logoImgUrl,
									"activityType": doc.activityType,
									"clubName": 11,
									"clubNo": 11,
									"enrollCount": doc.enrollCount,
									"signCount": doc.signCount,
									"lat": doc.lat || 0,
									"lag": doc.lag || 0,
									"newDate": new Date(),
									"signType": signType
								}
							});
						} else {

						}

					})


					// activityMemberModel.count({
					// 	activityId: activityId
					// }, function(err, enrollCount) {
					// 	if (!err) {
					// 		activityMemberModel.count({
					// 			activityId: activityId,
					// 			signType: 1
					// 		}, function(err, signCount) {
					// 			activityMemberModel.findOne({
					// 				activityId: activityId,
					// 				memberId: userId
					// 			}, function(err, menber) {
					// 				if (!menber) {
					// 					signType = "0"
					// 				} else {
					// 					if (menber.signType === "1") {
					// 						signType = "2"
					// 					} else {
					// 						signType = "1"
					// 					}
					// 				}
					// 				var clubName = "",
					// 					clubNo = "";
					// 				if (doc.clubId) {
					// 					clubName = doc.clubId.name;
					// 					clubNo = doc.clubId.clubNo;
					// 				}
					// 				return res.send({
					// 					code: "0000",
					// 					message: "ok",
					// 					result: {
					// 						"_id": doc._id,
					// 						"title": doc.title,
					// 						"introductionUrl": doc.introductionUrl,
					// 						"startDate": doc.startDate,
					// 						"endDate": doc.endDate,
					// 						"address": doc.address,
					// 						"kilometer": doc.kilometer,
					// 						"peopleNumber": doc.peopleNumber,
					// 						"publisher": doc.publisher,
					// 						"signEndDate": doc.signEndDate,
					// 						"memberType": doc.memberType,
					// 						"logoImgUrl": doc.logoImgUrl,
					// 						"activityType": doc.activityType,
					// 						"clubName": clubName,
					// 						"clubNo": clubNo,
					// 						"enrollCount": enrollCount,
					// 						"signCount": signCount,
					// 						"signType": signType,
					// 						"lat": doc.lat || 0,
					// 						"lag": doc.lag || 0,
					// 					}
					// 				});
					// 			})
					// 		})



					// 	} else {
					// 		return res.send({
					// 			code: "6001",
					// 			message: '查询失败',
					// 			result: err
					// 		})
					// 	}
					// });
				} else {
					return res.send({
						code: "6002",
						message: '查询失败',
						result: err
					})
				}
			})

			//activityMemberModel

		},

		//活动成员033
		getListActivityByMemberId: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};

			var body = req.body;
			if (!body.activityId) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			}

			var pageCount = body.pageCount || 1;
			var rows = body.rows || 20;
			var querys = activityMemberModel.find({
				activityId: body.activityId
			}).populate([{
				path: 'memberId',
				select: {
					nickName: 1,
					headImg: 1,
					mobile: 1
				},
				model: "user",
				match: {

				},
				options: {

				}
			}]);

			querys.skip((pageCount - 1) * rows);
			querys.limit(rows);
			//计算分页数据
			querys.exec(function(err, docs) {
				if (!err) {
					//查询公里数
					activityMemberModel.count({
						activityId: body.activityId
					}, function(err, result) {
						if (!err) {

							var data = [];
							var userData = [];
							for (var i = 0; i < docs.length; i++) {
								userData[i] = docs[i].memberId._id;
								data[i] = {
									userId: docs[i].memberId._id,
									signType: docs[i].signType,
									nickName: docs[i].memberId.nickName || "",
									mobile: docs[i].memberId.mobile,
									headImg: docs[i].memberId.headImg || ""
								};
							};

							runningCountModel.find({
									userId: {
										$in: userData
									},
									"type": "4"
								}, {
									userId: 1,
									kilometerCount: 1
								},
								function(err, kilometer) {
									if (!err) {
										for (var i = 0; i < data.length; i++) {
											for (var j = 0; j < kilometer.length; j++) {
												var c1 = data[i].userId.toString();
												var c2 = kilometer[j].userId.toString();
												if (c1 === c2) {
													data[i].kilometer = kilometer[j].kilometerCount
												}
											}
											if (kilometer.length == 0) {
												data[i].kilometer = 0;
											}
											//if()
										}
										return res.send({
											code: "0000",
											message: "ok",
											result: data,
										});
									} else {
										return res.send({
											code: "6002",
											message: '查询失败',
											result: err
										})
									}
								})



						} else {
							return res.send({
								code: "6002",
								message: '查询失败',
								result: err
							})
						}
					});
				} else {
					return res.send({
						code: "6002",
						message: '查询失败',
						result: err
					})
				}
			});

		}
	}

})();