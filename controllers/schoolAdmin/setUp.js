var util = require('../../utils/util.js');
var common = require('./common');
var setRuleModel = require('../../models/setRule');
var userGradeModel = require('../../models/userGrade');
var schoolUserModel = require('../../models/schoolUser');
var clubModel = require('../../models/club');
module.exports = (function() {
	var fn = {
		//查询俱乐部列表
		getClubList: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = clubModel.find({
					schoolId: user.schoolId,
				});
				_query.populate([{
					path: 'adminId',
					select: {
						nickName: 1
					},
					model: "schoolUser"
				}]);
				_query.sort({
					_id: -1
				});
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {


						clubModel.count({
							schoolId: user.schoolId,
						}, function(err, count) {
							if (!err) {
								var resultJson = [];
								for (var i = 0; i < doc.length; i++) {
									var nickName = "";
									if (doc[i].adminId) {
										nickName = doc[i].adminId.nickName
									}
									resultJson[i] = {
										_id: doc[i]._id,
										schoolId: doc[i].schoolId,
										clubNo: doc[i].clubNo,
										name: doc[i].name,
										nickName: nickName,
										createTime: doc[i].createTime
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
								common.error(res, "6003", "查询错误");
								return false;
							}
						});


					} else {
						common.error(res, "6003", "查询错误");
						return false;
					}
				})
			})
		},

		//设置等级
		// {
		// 	"schoolId": schoolId,
		// 	"kilometer1": 30,
		// 	"title1": "一级",
		// 	"kilometer2": 70,
		// 	"title2": "二级",
		// 	"kilometer3": 150,
		// 	"title3": "三级",
		// 	"kilometer4": 350,
		// 	"title4": "四级",
		// 	"kilometer5": 700,
		// 	"title5": "五级",
		// 	"kilometer6": 1500,
		//	"type":0
		// }
		setUserGrade: function(req, res) {
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
				var body = req.body
				if (!body.kilometer1 ||
					!body.title1 ||
					!body.kilometer2 ||
					!body.title2 ||
					!body.kilometer3 ||
					!body.title3 ||
					!body.kilometer4 ||
					!body.title4 ||
					!body.kilometer5 ||
					!body.title5 ||
					!body.title6) {
					return res.send({
						code: "6000",
						message: '缺少参数'
					});
				};
				var _query = {
					schoolId: user.schoolId,
					kilometer1: body.kilometer1,
					title1: body.title1,
					kilometer2: body.kilometer2,
					title2: body.title2,
					kilometer3: body.kilometer3,
					title3: body.title3,
					kilometer4: body.kilometer4,
					title4: body.title4,
					kilometer5: body.kilometer5,
					title5: body.title5,
					title6: body.title6,
					type: req.body.type || 0
				};

				userGradeModel.update({
					schoolId: user.schoolId
				}, _query, {
					upsert: true
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: 'ok',
							result: _query,
							doc: doc
						});
					} else {
						return res.send({
							code: "6002",
							message: '失败'
						});
					}
				})
			})
		},
		//获取学生等级
		getUserGradeBySchoolId: function(req, res) {
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
				var query = {
					schoolId: user.schoolId,
					type: 0
				};
				userGradeModel.findOne(query).exec(function(err, result) {
					if (!err) {
						if (result) {
							return res.send({
								code: "0000",
								message: user.schoolId,
								result: result
							});
						} else {
							userGradeModel.findOne({
								type: 1
							}).exec(function(err, doc) {
								if (!err) {
									return res.send({
										code: "0000",
										result: result,
										message: user.schoolId,
										result: doc
									});
								} else {
									return res.send({
										code: "6002",
										message: '修改失败'
									});
								}
							})
						}

					} else {
						return res.send({
							code: "6002",
							message: '修改失败'
						});
					}
				})
			})
		},
		//设置基本设置
		setRule: function(req, res) {
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
				var body = req.body
				var query = {
					schoolId: user.schoolId,
					targetCredits: body.targetCredits || null,
					excellentCredit: body.excellentCredit || null,
					passCredit: body.passCredit || null,
					creditKiometer: body.creditKiometer || null,
					creditActivity: body.creditActivity || null,
					bigCreditActivity: body.bigCreditActivity || null,
					smallSpeed: body.smallSpeed || null,
					bigSpeed: body.bigSpeed || null,
					lastSemesterStartTime: body.lastSemesterStartTime || null,
					lastSemesterEntTime: body.lastSemesterEntTime || null,
					nextSemesterStartTime: body.nextSemesterStartTime || null,
					nextSemesterEndTime: body.nextSemesterEndTime || null
				};
				//console.log(query)
				setRuleModel.update({
					schoolId: user.schoolId
				}, {
					$set: query
				}, {
					upsert: true
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: 'ok',
							result1: doc,
							result: query
						});
					} else {
						return res.send({
							code: "6002",
							message: '设置失败'
						});
					}
				})
			})
		},
		/*获取基本设置*/
		getRuleBySchoolId: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				setRuleModel.findOne({
					schoolId: user.schoolId
				}, function(err, result) {
					if (!err) {
						return res.send({
							code: "0000",
							message: 'ok',
							result: result
						});
					} else {
						return res.send({
							code: "6002",
							message: '修改失败'
						});
					}
				})
			})
		},
		//添加管理员
		/*
			{
				"username":"zhangsan",
				"nickName":"张三",
				"sex":"1",
				"mobile":"13359257814",
				"group":2,
			}
		*/
		addAdmin: function(req, res) {
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
				}
				var body = req.body;
				if (!body.username ||
					!body.nickName ||
					!body.sex ||
					!body.group) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				var query = {
					schoolId: user.schoolId,
					username: body.username,
					nickName: body.nickName,
					sex: body.sex,
					password: util.md5("000000").toUpperCase(),
					mobile: body.mobile || "",
					group: body.group,
				}
				schoolUserModel.findOne({
					username: body.username,
				}, function(err, doc) {
					if (!err) {
						if (!doc) {
							schoolUserModel.create(query, function(err, schoolUser) {
								if (!err) {
									return res.send({
										code: "0000",
										message: "ok",
										result: schoolUser
									})
								} else {
									common.error(res, "6003", "新增失败");
									return false;
								}
							})
						} else {
							common.error(res, "6002", "用户已存在");
							return false;
						}
					} else {
						common.error(res, "6003", "查询错误");
						return false;
					}
				})
			})
		},
		//获取管理员信息
		getAdmin: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var body = req.body;
				if (!body.adminId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				schoolUserModel.findOne({
					_id: body.adminId,
				}, {
					"schoolId": user.schoolId,
					"username": 1,
					"nickName": 1,
					"sex": 1,
					"mobile": 1,
					"group": 1
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: doc
						})
					} else {
						common.error(res, "6003", "查询错误");
						return false;
					}
				})
			})
		},
		//编辑管理员
		editAdmin: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var body = req.body;
				if (!body.username ||
					!body.nickName ||
					!body.adminId ||
					!body.sex ||
					!body.group) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				var query = {
					_id: body.adminId,
					schoolId: user.schoolId,
					username: body.username,
					nickName: body.nickName,
					sex: body.sex,
					mobile: body.mobile || "",
					group: body.group,
				}
				schoolUserModel.update({
					_id: body.adminId,
				}, {
					$set: query
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: query
						})
					} else {
						common.error(res, "6003", "查询错误");
						return false;
					}
				})
			})
		},
		//删除管理员
		delAdmin: function(req, res) {
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
				if (!body.adminId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				schoolUserModel.remove({
					_id: body.adminId,
				}, function(err, doc) {
					if (!err) {
						return res.send({
							code: "0000",
							message: "ok",
							result: {
								userId: body.adminId
							}
						})
					} else {
						common.error(res, "6003", "失败");
						return false;
					}
				})
			})
		},
		//管理员列表
		adminList: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var query = {};
				if (user.group == 1) {
					query = {
						schoolId: user.schoolId,
					}
				} else if (user.group == 2) {
					query = {
						schoolId: user.schoolId,
						_id: user._id
					}
				};
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = schoolUserModel.find(query).sort({
					"_id": -1
				}).skip((pageCount - 1) * rows).limit(rows).exec(function(err, docs) {
					if (!err) {
						schoolUserModel.count({
							schoolId: user.schoolId,
						}, function(err, count) {
							if (!err) {
								return res.send({
									code: "0000",
									message: 'ok',
									result: {
										pageCount: pageCount,
										total: count,
										listData: docs
									}
								})
							} else {
								common.error(res, "6003", "获取总条数失败");
								return false;
							}
						})

					} else {
						common.error(res, "6003", "查询错误");
						return false;
					}
				})

			})
		},
		//修改密码
		/*
		{
			"oldPassword": "000000",
			"newPassword": "000000",
		}
		*/
		editPassword: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}
				var body = req.body;

				if (!body.oldPassword ||
					!body.newPassword) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				if (!body.oldPassword ||
					!body.newPassword) {
					common.error(res, "6000", "缺少参数");
					return false;
				}
				var password = util.md5(body.oldPassword).toUpperCase();
				var newPassword = util.md5(body.newPassword).toUpperCase();

				schoolUserModel.update({
					_id: user._id,
					password: password
				}, {
					$set: {
						password: newPassword
					}
				}, function(err, doc) {
					if (!err) {
						if (doc.n == 0) {
							common.error(res, "6003", "失败");
							return false;
						} else if (doc.n == 1 && doc.nModified == 0) {
							common.error(res, "6003", "不能和旧密码相同");
							return false;
						}
						return res.send({
							code: "0000",
							message: "ok",
							result: ""
						})
					} else {
						common.error(res, "6003", "失败");
						return false;
					}
				})
			})
		},
		//重置密码
		resetPassword: function(req, res) {
			common.userVerify(req, res, function(user) {
				if (!user) {
					return res.send({
						code: "6005",
						message: "该用户不存在"
					})
				}

				if (!req.body.userId) {
					common.error(res, "6000", "缺少参数");
					return false;
				}

				schoolUserModel.update({
					_id: req.body.userId
				}, {
					$set: {
						password: util.md5("000000").toUpperCase()
					}
				}, function(err, doc) {
					if (!err) {
						if (doc.n == 0) {
							common.error(res, "6003", "失败");
							return false;
						}
						return res.send({
							code: "0000",
							message: "ok",
							result: req.body.userId
						})
					} else {
						common.error(res, "6003", "失败");
						return false;
					}
				})
			})
		},
	}
	return fn;
})();