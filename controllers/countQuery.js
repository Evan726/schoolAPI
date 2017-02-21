var util = require('./../utils/util.js');
var runningQueryModel = require('./../models/running');
var runningCountModel = require('./../models/runningCount');
var userQueryModel = require('./../models/user');
var userModel = require('./../models/user');
var setRuleModel = require('./../models/setRule');
var activityMemberModel = require('./../models/activityMember');
module.exports = (function() {
	var fn = {
		//获取学分规则
		getRuleBySchoolId: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			var body = req.body
			if (!body.schoolId) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			};
			setRuleModel.findOne({
				schoolId: body.schoolId
			}, function(err, Rule) {
				if (!err) {
					return res.send({
						code: "0000",
						message: "ok",
						result: Rule
					});
				} else {
					return res.send({
						code: "6003",
						message: '缺少token或userId参数'
					});
				}
			})
		},
		/*查看学分统计018*/
		getAchievementsCountList: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			var body = req.body
			if (!body.schoolId) {
				return res.send({
					code: "6000",
					message: '缺少参数'
				});
			};

			setRuleModel.findOne({
				schoolId: body.schoolId
			}, function(err, Rule) {
				if (!err) {
					if (!!Rule) {
						activityMemberModel.count({
							memberId: userId,
							signType: "1",
							isEffective: "1"
						}, function(err, activityMember) {
							if (!err) {
								runningCountModel.find({
									userId: userId,
									type: "3"
								}).sort({
									signType: -1
								}).exec(function(err, MonthCount) {
									if (!err) {

										var dataArr = [];
										if (MonthCount) {
											for (var i = 0; i < MonthCount.length; i++) {

												//活动积分
												var creditActivity = activityMember * Rule.creditActivity
												var creditKilometer = MonthCount[i].kilometerCount * Rule.creditKiometer
												var creditCount = creditActivity + creditKilometer;
												var gradeState = 0;
												if (creditCount >= Rule.excellentCredit) {
													gradeState = 2;
												} else if (creditCount < Rule.excellentCredit && creditCount >= Rule.passCredit) {
													gradeState = 1;
												}

												if (i === 0) {
													dataArr[i] = {
														time: "本学期",
														kilometerCount: MonthCount[i].kilometerCount,
														creditCount: creditKilometer,
														gradeState: gradeState
													}
												} else {
													dataArr[i] = {
														time: MonthCount[i].startTime + "至" + MonthCount[i].endTime,
														kilometerCount: MonthCount[i].kilometerCount,
														creditCount: creditCount,
														gradeState: gradeState
													}
												}

											}
										}

										return res.send({
											code: "0000",
											message: "ok",
											result: dataArr
										});
									} else {
										return res.send({
											code: "6002",
											message: "查询失败"
										});
									}
								})

							} else {
								return res.send({
									code: "6004",
									message: "查询失败"
								});
							}
						})
					} else {
						return res.send({
							code: "0000",
							message: "ok",
							result: []
						});

					}

				} else {
					return res.send({
						code: "6003",
						message: "查询失败"
					});
				}
			})

		},



		/*查看跑步统计（ 周） 022*/
		getRunningbyWeekCount: function(req, res) {

			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			// console.log(1, util.getDays().firstData)
			// console.log(2, util.getDays().lastData)
			runningCountModel.findOne({
				userId: userId,
				countTime: {
					$gte: util.getDays().firstData,
					$lt: util.getDays().lastData
				},
				type: "1"
			}, {
				userId: 1,
				equallySpeed: 1,
				calorieCount: 1,
				kilometerCount: 1,
				equallyPace: 1,
				durationCount: 1,
				count: 1,
				ranking: 1
			}, function(err, doc) {
				if (!err) {
					if (!!doc) {
						runningCountModel.find({
							userId: doc.userId,
							countTime: {
								$gte: util.getDays().firstData,
								$lt: util.getDays().lastData
							},
							type: "0"
						}, {
							countTime: 1,
							kilometerCount: 1
						}, function(err, docs) {
							if (!err) {
								var docsList = [];
								for (var i = 0; i < docs.length; i++) {
									docsList[i] = {
										countTime: docs[i].countTime.getMonth() + 1 + "-" + docs[i].countTime.getDate(),
										kilometerCount: docs[i].kilometerCount
									}
								}

								var listData = [];
								var weeksArr = util.getDays().days;
								for (var i = 0; i < weeksArr.length; i++) {
									for (var j = 0; j < docsList.length; j++) {
										if (weeksArr[i] === docsList[j].countTime) {
											listData[i] = {
												countTime: weeksArr[i],
												kilometerCount: docsList[j].kilometerCount
											}
											break;
										}
										listData[i] = {
											countTime: weeksArr[i],
											kilometerCount: 0
										}
									}
								}


								var data = {
									userId: doc.userId,
									speed: doc.equallySpeed,
									calorie: doc.calorieCount,
									kiometer: doc.kilometerCount,
									pace: doc.equallyPace,
									duration: doc.durationCount,
									count: doc.count,
									ranking: doc.ranking,
									listData: listData
								}
								return res.send({
									code: "0000",
									message: "ok",
									result: data
								});
							}
							return res.send({
								code: "6002",
								message: "查询失败"
							});
						});
					} else {
						var listData = []
						var monthsArr = util.getDays().days;

						for (var i = 0; i < monthsArr.length; i++) {
							listData[i] = {
								countTime: monthsArr[i],
								kilometerCount: 0
							};
						}

						var data = {
							userId: userId,
							speed: 0,
							calorie: 0,
							kiometer: 0,
							pace: 0,
							duration: 0,
							count: 0,
							ranking: 0,
							listData: listData
						}
						return res.send({
							code: "0000",
							message: "ok",
							result: data
						});
					}
				} else {
					return res.send({
						code: "6002",
						message: "查询失败"
					});
				}
			})
		},


		/*查看跑步统计（ 月） 023*/
		getRunningbyMonthCount: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			runningCountModel.findOne({
				userId: userId,
				countTime: {
					$gte: util.getCurrentMonthFirst().data,
					$lt: util.getCurrentMonthLast().data
				},
				type: "2"
			}, {
				userId: 1,
				equallySpeed: 1,
				calorieCount: 1,
				kilometerCount: 1,
				equallyPace: 1,
				durationCount: 1,
				count: 1,
				ranking: 1
			}, function(err, doc) {
				if (!err) {
					if (!!doc) {
						runningCountModel.find({
							userId: doc.userId,
							countTime: {
								$gte: util.getCurrentMonthFirst().data,
								$lt: util.getCurrentMonthLast().data
							},
							type: "0"
						}, {
							countTime: 1,
							kilometerCount: 1
						}, function(err, docs) {
							if (!err) {
								var docsList = [];
								for (var i = 0; i < docs.length; i++) {
									docsList[i] = {
										countTime: docs[i].countTime.getMonth() + 1 + "-" + docs[i].countTime.getDate(),
										kilometerCount: docs[i].kilometerCount
									}
								}

								var listData = [];
								var monthsArr = util.getCurrentMonthFirst().days;
								for (var i = 0; i < monthsArr.length; i++) {
									for (var j = 0; j < docsList.length; j++) {
										if (monthsArr[i] === docsList[j].countTime) {
											listData[i] = {
												countTime: monthsArr[i],
												kilometerCount: docsList[j].kilometerCount
											}
											break;
										}
										listData[i] = {
											countTime: monthsArr[i],
											kilometerCount: 0
										}
									}
								}


								var data = {
									userId: doc.userId,
									speed: doc.equallySpeed,
									calorie: doc.calorieCount,
									kiometer: doc.kilometerCount,
									pace: doc.equallyPace,
									duration: doc.durationCount,
									count: doc.count,
									ranking: doc.ranking,
									listData: listData
								}
								return res.send({
									code: "0000",
									message: "ok",
									result: data
								});
							}
							return res.send({
								code: "6002",
								message: "查询失败"
							});
						});
					} else {
						var listData = []
						var monthsArr = monthsArr = util.getCurrentMonthFirst().days;

						for (var i = 0; i < monthsArr.length; i++) {
							listData[i] = {
								countTime: monthsArr[i],
								kilometerCount: 0
							};
						}

						var data = {
							userId: userId,
							speed: 0,
							calorie: 0,
							kiometer: 0,
							pace: 0,
							duration: 0,
							count: 0,
							ranking: 0,
							listData: listData
						}
						return res.send({
							code: "0000",
							message: "ok",
							result: data
						});
					}
				} else {
					return res.send({
						code: "6002",
						message: "查询失败"
					});
				}
			})

		},

		/*查看跑步统计（ 本学期） 024*/
		getRunningbySemesterCount: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};

			userModel.findOne({
				_id: userId
			}, {
				createTime: 1,
				schoolId: 1
			}, function(err, user) {
				var nowTime = new Date();
				var year = nowTime.getFullYear()
				var month = nowTime.getMonth() + 1;
				var day = nowTime.getDate()
				if (!user.schoolId) {
					return res.send({
						code: "6001",
						message: "你还不是学生，请认证"
					});
				}
				setRuleModel.findOne({
					schoolId: user.schoolId
				}, {
					lastSemesterStartTime: 1,
					lastSemesterEntTime: 1,
					nextSemesterStartTime: 1,
					nextSemesterEndTime: 1,
				}, function(err, Rule) {
					if (!err) {
						if (!!Rule) {
							var lastSemesterStartTime,
								lastSemesterEntTime,
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

							var startTime = "",
								endTime = "";
							if (new Date() > new Date(lastSemesterStartTime + "-1") && new Date() < new Date(nextSemesterStartTime + "-1")) {
								startTime = lastSemesterStartTime;
								endTime = lastSemesterEndTime;
							} else {
								startTime = nextSemesterStartTime;
								endTime = nextSemesterEndTime;
							};
							var date1 = startTime.split("-");
							var date2 = endTime.split("-");
							//获取年,月数
							var year1 = parseInt(date1[0]),
								month1 = parseInt(date1[1]),
								year2 = parseInt(date2[0]),
								month2 = parseInt(date2[1]),
								//通过年,月差计算月份差
								months = (year2 - year1) * 12 + (month2 - month1) + 1;
							var monthArr = [];

							if (year2 > year1 && months <= 12) {
								for (var i = 0; i <= 12 - month1; i++) {
									monthArr[i] = month1 + i + "月"
								}
								for (var j = 0; j < month2; j++) {
									monthArr[monthArr.length + j] = j + 1 + "月"
								}
							} else if (year2 == year1) {
								for (var i = 0; i <= month2 - month1; i++) {
									monthArr[i] = month1 + i + "月"
								}
							} else {
								monthArr = ["8月", "9月", "10月", "11月", "12月"]
							}

							var _time = {
								startTime: startTime,
								startDays: util.getCurrentMonthFirst(startTime).data,
								endTime: endTime,
								endDays: util.getCurrentMonthLast(endTime).data,
								monthArr: monthArr
							};
							_count(userId, _time);
						} else {

							var _time = {
								startTime: startTime,
								startDays: util.getCurrentMonthFirst(startTime).data,
								endTime: endTime,
								endDays: util.getCurrentMonthLast(endTime).data,
								monthArr: monthArr
							};
							_count(userId, _time);
						}
					} else {
						console.log("查看基础设置月份错误：", err)
					}
				})
			})

			//本学期的统计
			function _count(userId, _time) {
				runningCountModel.findOne({
					userId: userId,
					countTime: {
						$gte: _time.startDays,
						$lt: _time.endDays
					},
					type: "3"
				}, {
					userId: 1,
					equallySpeed: 1,
					calorieCount: 1,
					kilometerCount: 1,
					equallyPace: 1,
					durationCount: 1,
					count: 1,
					ranking: 1
				}, function(err, doc) {
					if (!err) {
						if (!!doc) {
							runningCountModel.find({
								userId: doc.userId,
								countTime: {
									$gte: _time.startDays,
									$lt: _time.endDays
								},
								type: "2"
							}, {
								countTime: 1,
								kilometerCount: 1
							}, function(err, docs) {
								if (!err) {
									var docsList = [];
									for (var i = 0; i < docs.length; i++) {
										docsList[i] = {
											countTime: docs[i].countTime.getMonth() + 1 + "-" + docs[i].countTime.getDate(),
											kilometerCount: docs[i].kilometerCount
										}
									}
									var listData = [];
									var monthsArr = _time.monthArr;
									for (var i = 0; i < monthsArr.length; i++) {
										for (var j = 0; j < docsList.length; j++) {

											var docsMonth = docsList[j].countTime.split("-")[0] + "月";

											if (monthsArr[i] === docsMonth) {
												listData[i] = {
													countTime: monthsArr[i],
													kilometerCount: docsList[j].kilometerCount
												}
												break;
											}
											listData[i] = {
												countTime: monthsArr[i],
												kilometerCount: 0
											}
										}
									}


									var data = {
										userId: doc.userId,
										speed: doc.equallySpeed,
										calorie: doc.calorieCount,
										kiometer: doc.kilometerCount,
										pace: doc.equallyPace,
										duration: doc.durationCount,
										count: doc.count,
										ranking: doc.ranking,
										listData: listData
									}
									return res.send({
										code: "0000",
										message: "ok",
										result: data
									});
								}
								return res.send({
									code: "6002",
									message: "查询失败"
								});
							});
						} else {
							var listData = []
							var monthsArr = _time.monthArr;
							for (var i = 0; i < monthsArr.length; i++) {
								listData[i] = {
									countTime: monthsArr[i],
									kilometerCount: 0
								};
							}

							var data = {
								userId: userId,
								speed: 0,
								calorie: 0,
								kiometer: 0,
								pace: 0,
								duration: 0,
								count: 0,
								ranking: 0,
								listData: listData
							}
							return res.send({
								code: "0000",
								message: "ok",
								result: data
							});
						}
					} else {
						return res.send({
							code: "6002",
							message: "查询失败"
						});
					}
				})
			}
		},
		/*查看跑步统计（总）021*/
		getRunningbyCount: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			userModel.findOne({
				_id: userId
			}, {
				createTime: 1,
				schoolId: 1
			}, function(err, user) {
				if (!err) {
					var createTime = user.createTime;
					var nowTime = new Date();
					//注册年
					var regYears = [];
					var resArr = [];

					var len = nowTime.getFullYear() - createTime.getFullYear();

					if (len < 4) {
						len = 4
					}

					for (var i = 0; i <= len; i++) {
						regYears[i] = createTime.getFullYear() + i;
						resArr[i] = {
							startDays: util.getCurrentMonthFirst(regYears[i] + "01").data,
							endDays: util.getCurrentMonthLast(regYears[i] + "12").data
						}
					}


					var _time = {
						resArr: resArr,
						regYears: regYears
					};
					//console.log(_time);
					_count(userId, _time)
				} else {
					return res.send({
						code: "6002",
						message: "查询失败"
					});
				}

			})

			//本学期的统计
			function _count(userId, _time) {
				runningCountModel.findOne({
					userId: userId,
					type: "4"
				}, {
					userId: 1,
					equallySpeed: 1,
					calorieCount: 1,
					kilometerCount: 1,
					equallyPace: 1,
					durationCount: 1,
					count: 1,
					ranking: 1
				}, function(err, doc) {
					if (!err) {
						if (!!doc) {
							runningCountModel.find({
								userId: doc.userId,
								type: "3"
							}, function(err, docs) {
								if (!err) {
									var docsList = [];
									for (var i = 0; i < docs.length; i++) {
										docsList[i] = {
											countTime: docs[i].countTime.getFullYear(),
											kilometerCount: docs[i].kilometerCount
										}
									}

									var listData = [];
									var regYears = _time.regYears;
									for (var i = 0; i < regYears.length; i++) {
										listData[i] = {
											countTime: regYears[i],
											kilometerCount: 0
										}
										for (var j = 0; j < docsList.length; j++) {
											var docsYear = docsList[j].countTime;
											//console.log("1:", docsYear)
											if (regYears[i] === docsYear) {
												listData[i] = {
													countTime: listData[i].countTime,
													kilometerCount: listData[i].kilometerCount + docsList[j].kilometerCount
												};
											}
										}

									}

									var data = {
										userId: doc.userId,
										speed: doc.equallySpeed,
										calorie: doc.calorieCount,
										kiometer: doc.kilometerCount,
										pace: doc.equallyPace,
										duration: doc.durationCount,
										count: doc.count,
										ranking: doc.ranking,
										//docs: docs,
										//docsList: docsList,
										listData: listData
									}
									return res.send({
										code: "0000",
										message: "ok",
										result: data
									});
								}
								return res.send({
									code: "6002",
									message: "查询失败"
								});
							});
						} else {
							var listData = []
							var regYears = _time.regYears;

							for (var i = 0; i < regYears.length; i++) {
								listData[i] = {
									countTime: regYears[i],
									kilometerCount: 0
								};
							}

							var data = {
								userId: userId,
								speed: 0,
								calorie: 0,
								kiometer: 0,
								pace: 0,
								duration: 0,
								count: 0,
								ranking: 0,
								listData: listData
							}
							return res.send({
								code: "0000",
								message: "ok",
								result: data
							});
						}
					} else {
						return res.send({
							code: "6002",
							message: "查询失败"
						});
					}
				})
			}
		},

		getRanking: function(req, res) {
			var token = req.query.token;
			var userId = req.query.userId;
			if (!token || !userId) {
				return res.send({
					code: 6001,
					message: '缺少token或userId参数'
				});
			};
			runningCountModel.findOne({
					"type": "4",
					"userId": userId
				},
				function(err, doc) {
					if (!err) {

						if (!!doc) {
							runningCountModel.count({
								"type": "4"
							}, function(err, count) {
								if (!err) {
									runningCountModel.count({
										"type": "4",
										kilometerCount: {
											$gt: doc.kilometerCount
										}
									}, function(err, rank) {
										if (!err) {
											var ranking = "0%";

											if (count != 0) {
												var r = Math.ceil((count - rank) / count * 100);
												if (r == 100) {
													ranking = "99%";
												} else {
													ranking = r + "%";
												}
											}
											return res.send({
												code: "0000",
												message: "ok",
												result: {
													ranking: ranking
												}
											});
										} else {
											return res.send({
												code: "6003",
												message: "查询失败"
											});
										}
									})
								} else {
									return res.send({
										code: "0000",
										message: "ok",
										result: {
											ranking: "0%"
										}
									});
								}
							});
						} else {
							return res.send({
								code: "0000",
								message: "ok",
								result: {
									ranking: "0%"
								}
							});
						}
					} else {
						return res.send({
							code: "6003",
							message: "查询失败"
						});
					}
				});
		}

	};
	return fn
})()