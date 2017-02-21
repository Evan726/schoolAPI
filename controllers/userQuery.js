var userModel = require('./../models/user');
var runningCountModel = require('./../models/runningCount');
var userGradeModel = require('./../models/userGrade');
module.exports = (function() {
	return fn = {
		getUserById: function(req, res) {
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
			}).populate([{
				path: 'clubId',
				select: {
					name: 1
				},
				model: "clubs"
			}, {
				path: 'schoolId',
				select: {
					name: 1
				},
				model: "school"
			}]).exec(function(err, user) {
				if (!err && !!user) {
					var schoolId = "",
						schoolName = "",
						clubName = "",
						clubId = "";
					if (user.schoolId) {
						schoolId = user.schoolId._id;
						schoolName = user.schoolId.name;
					}
					if (user.clubId) {
						clubId = user.clubId._id;
						clubName = user.clubId.name;
					}

					var data = {
						_id: user._id,
						studentNo: user.studentNo,
						schoolId: schoolId,
						schoolName: schoolName,
						mobile: user.mobile,
						nickName: user.nickName,
						headImg: user.headImg,
						birthday: user.birthday,
						sex: user.sex,
						height: user.height,
						weight: user.weight,
						admission: user.admission,
						lat: user.lat,
						lag: user.lag,
						clubName: clubName,
						clubId: clubId,
						lastLoginTime: user.lastLoginTime
					};


					return res.send({
						code: "0000",
						message: 'ok',
						result: data
					});


				}
				return res.send({
					code: "6001",
					message: "查询失败"
				})
			})
		},


		//用户等级
		getUserGradeByUserId: function(req, res) {
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
				type: "4"
			}, function(err, result) {
				if (!err) {
					var kilometerCount = 0;
					if (result) {
						kilometerCount = result.kilometerCount;
					};

					var gradeQuery = {};
					if (req.body.schoolId) {
						gradeQuery = {
							schoolId: req.body.schoolId,
							type: 0
						}
					} else {
						gradeQuery = {
							type: 1
						}
					}

					userGradeModel.findOne(gradeQuery).exec(function(err, doc) {
						if (!err) {
							if (doc) {
								Grade(kilometerCount, doc);
							} else {
								userGradeModel.findOne({
									type: 1
								}).exec(function(err, docs) {
									if (!err) {
										if (docs) {
											Grade(kilometerCount, docs);
										} else {
											//console.log("请设置默认等级")
											return res.send({
												code: "0000",
												message: 'ok',
												result: "士兵"
											});
										}

									} else {
										return res.send({
											code: "6001",
											message: "查询失败"
										});
									}
								})
							}

							function Grade(kilometerCount, doc) {
								var title = "";
								if (kilometerCount <= doc.kilometer1) {
									title = doc.title1;
								} else if (kilometerCount <= doc.kilometer2) {
									title = doc.title2;
								} else if (kilometerCount <= doc.kilometer3) {
									title = doc.title3;
								} else if (kilometerCount <= doc.kilometer4) {
									title = doc.title4;
								} else if (kilometerCount <= doc.kilometer5) {
									title = doc.title5;
								} else if (kilometerCount > doc.kilometer5) {
									title = doc.title6
								} else {
									title = doc.title1
								}
								return res.send({
									code: "0000",
									message: 'ok',
									result: title
								});
							}
						} else {
							return res.send({
								code: "6001",
								message: "查询失败"
							});
						}
					});
				} else {
					return res.send({
						code: "6001",
						message: "查询失败"
					})
				}
			})


		}
	}
})();