var util = require('../utils/util.js')
var runningModel = require('./../models/running');
var runningNodeModel = require('./../models/runningNode');
var runningCountModel = require('./../models/runningCount');
var setRuleModel = require('./../models/setRule');
var userModel = require('./../models/user');
var activityMemberModel = require('./../models/activityMember');
require('core-js/fn/object/assign');

module.exports = (
    function() {
        var fn = {
            /*
              创建跑步016
              */
            creatRunning: function(req, res) {
                //console.log("req.body:", req.body);
                //console.log("req.query:", req.query);
                var token = req.query.token;
                var userId = req.query.userId;
                if (!token || !userId) {
                    return res.send({
                        code: "6001",
                        message: '缺少token或userId参数'
                    });
                };
                var body = req.body;

                if (!(body.calorieCount >= 0) ||
                    !(body.kilometerCount >= 0) ||
                    !(body.durationCount >= 0) ||
                    !body.equallySpeed ||
                    !(body.equallyPace >= 0) ||
                    !(body.highPace >= 0) ||
                    !(body.lowPace >= 0) ||
                    !body.startDate ||
                    !body.endDate ||
                    !body.isEffective ||
                    !body.runningNode
                ) {
                    return res.send({
                        code: "6000",
                        message: '参数错误'
                    });
                }
                //判断跑步数据类型
                if (!typeof body.calorieCount == "number" ||
                    !typeof body.kilometerCount == "number" ||
                    !typeof body.durationCount == "number" ||
                    !typeof body.equallySpeed == "string" ||
                    !typeof body.highPace == "number" ||
                    !typeof body.lowPace == "number" ||
                    !typeof body.lat == "number" ||
                    !typeof body.lag == "number") {
                    return res.send({
                        code: "6001",
                        message: '参数值类型错误'
                    });
                }
                //判断节点数据类型
                if (!Array.isArray(body.runningNode)) {
                    return res.send({
                        code: "6002",
                        message: 'runningNode参数格式错误'
                    });
                };


                body.runningNode.forEach(function(element, index, input) {
                    if (!element.speed ||
                        !(element.calorie >= 0) ||
                        !(element.kiometer >= 0) ||
                        !(element.pace >= 0) ||
                        !(element.duration >= 0) ||
                        !element.color ||
                        !element.isKilometerNode ||
                        !element.lat ||
                        !element.lag ||
                        !element.nowDate) {
                        return res.send({
                            code: "6004",
                            message: '参数错误'
                        });
                    }
                    if (!typeof element.speed == "string" ||
                        !typeof element.calorie == "number" ||
                        !typeof element.kiometer == "number" ||
                        !typeof element.pace == "number" ||
                        !typeof element.duration == "number" ||
                        !typeof element.lat == "number" ||
                        !typeof element.lag == "number")

                    {
                        return res.send({
                            code: "6005",
                            message: '参数值类型错误'
                        });
                    }
                });

                var query = {
                    calorieCount: body.calorieCount,
                    kilometerCount: body.kilometerCount,
                    durationCount: body.durationCount,
                    equallySpeed: body.equallySpeed,
                    equallyPace: body.equallyPace,
                    highPace: body.highPace,
                    lowPace: body.lowPace,
                    userId: req.query.userId,
                    startDate: body.startDate,
                    endDate: body.endDate,
                    isEffective: body.isEffective
                };

                if (!!body.activityId && body.activityId.length === 24) {
                    query = Object.assign({}, query, {
                        activityId: body.activityId
                    })
                }
                runningModel.create(query, function(err, doc) {
                    if (!err) {
                        //写入轨迹
                        var queryArr = body.runningNode.map(function(element, index) {
                            return Object.assign({}, element, {
                                runningId: doc._id
                            });
                        })
                        runningNodeModel.create(queryArr, function(err, docs) {
                            if (!err) {
                                res.send({
                                    code: "0000",
                                    message: "ok",
                                    result: doc._id
                                });
                                var reqJson = {
                                    userId: userId,
                                    equallySpeed: doc.equallySpeed,
                                    calorieCount: doc.calorieCount,
                                    kilometerCount: doc.kilometerCount,
                                    equallyPace: doc.equallyPace,
                                    durationCount: doc.durationCount
                                };
                                var reqData = {
                                    userId: userId
                                };

                                if (body.isEffective == "1") {
                                    fn.CountTime(reqJson, "0", reqData);
                                    fn.CountTime(reqJson, "1", reqData);
                                    fn.CountTime(reqJson, "2", reqData);
                                    fn.CountTime(reqJson, "3", reqData);
                                    fn.CountTime(reqJson, "4", reqData);
                                    if (body.activityId) {
                                        activityMemberModel.update({
                                            memberId: userId,
                                            activityId: body.activityId
                                        }, {
                                            isEffective: 1
                                        }, function(err, dddd) {

                                        });
                                    }
                                }
                            } else {
                                return res.send({
                                    code: "6002",
                                    message: '创建失败',
                                    result: err
                                })
                            }
                        })
                    } else {
                        return res.send({
                            code: "6001",
                            message: '创建失败',
                            result: err
                        })
                    }

                });
            },
            CountTime: function(reqJson, type, reqData) {

                var newData;
                switch (type) {
                    case "0":
                        newData = util.countTime().today;
                        fn.addRunningCount(reqJson, newData, type);
                        break;
                    case "1":
                        newData = util.getDays().firstData;
                        fn.addRunningCount(reqJson, newData, type);
                        break;
                    case "2":
                        newData = util.getCurrentMonthFirst().data;
                        fn.addRunningCount(reqJson, newData, type);
                        break;
                    case "3":
                        userModel.findOne({
                            _id: reqData.userId
                        }, {
                            createTime: 1,
                            schoolId: 1
                        }, function(err, user) {
                            console.log("3-----", user)
                            var createTime = new Date();
                            var year = createTime.getFullYear();
                            //判断是否是学生
                            if (!!user.schoolId) {
                                setRuleModel.findOne({
                                    schoolId: user.schoolId
                                }, {
                                    lastSemesterStartTime: 1,
                                    lastSemesterEntTime: 1,
                                    nextSemesterStartTime: 1,
                                    nextSemesterEndTime: 1,
                                }, function(err, Rule) {
                                    if (!err) {
                                        //console.log(Rule)
                                        var lastSemesterStartTime,
                                            lastSemesterEntTime,
                                            nextSemesterStartTime,
                                            nextSemesterEndTime;
                                        if (Rule.lastSemesterStartTime > createTime.getMonth() + 1) {
                                            year = year - 1;
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

                                        // console.log("上学期开始时间：", lastSemesterStartTime);
                                        // console.log("上学期end时间：", lastSemesterEndTime);
                                        // console.log("下学期开始时间：", nextSemesterStartTime);
                                        // console.log("下学期end时间：", nextSemesterEndTime);
                                        var startTime = "";
                                        if (new Date() > new Date(lastSemesterStartTime + "-1") && new Date() < new Date(nextSemesterStartTime + "-1")) {
                                            startTime = lastSemesterStartTime;
                                            endTime = lastSemesterEndTime;
                                        } else {
                                            startTime = nextSemesterStartTime;
                                            endTime = nextSemesterEndTime;
                                        };
                                        newData = util.countTime(startTime + "-1").today;
                                        //console.log("333:", newData);
                                        var _time = {
                                            startTime: startTime,
                                            endTime: endTime
                                        };
                                        //console.log(_time);
                                        fn.addRunningCount(reqJson, newData, type, _time);
                                    } else {
                                        console.log("查看基础设置月份错误：", err)
                                    }

                                })
                            } else {
                                //console.log("该用户非学生")
                            }

                        })
                        break;
                    default:
                        userModel.findOne({
                            _id: reqData.userId
                        }, {
                            createTime: 1
                        }, function(err, createTime) {
                            newData = util.countTime(createTime.createTime).today;
                            //console.log("123", newData);
                            fn.addRunningCount(reqJson, newData, "4");
                        })
                        break;
                }

            },
            addRunningCount: function(reqJson, newData, type, _time) {

                var query = {
                    "countTime": {
                        $gt: newData
                    },
                    type: type,
                    userId: reqJson.userId
                };
                var startTime = "",
                    endTime = "";
                if (!!_time) {
                    startTime = _time.startTime;
                    endTime = _time.endTime;
                };
                runningCountModel.findOne(query, function(err, doc) {
                    if (!err) {
                        //是否有数据
                        if (!!doc) {
                            var _query = {
                                equallySpeed: reqJson.equallySpeed + doc.equallySpeed,
                                calorieCount: reqJson.calorieCount + doc.calorieCount,
                                kilometerCount: reqJson.kilometerCount + doc.kilometerCount,
                                equallyPace: reqJson.equallyPace + doc.equallyPace,
                                durationCount: reqJson.durationCount + doc.durationCount,
                                type: type,
                                count: 1 + doc.count, //跑步次数
                                ranking: 0, //排名
                                countTime: new Date(),
                                startTime: startTime,
                                endTime: endTime
                            }
                            runningCountModel.update({
                                _id: doc._id
                            }, {
                                $set: _query
                            }, function(err, result) {
                                //console.log("addRunningCount----err:", err)
                                //console.log("addRunningCount----result:", result)
                            });
                        } else {
                            var _query = {
                                userId: reqJson.userId,
                                equallySpeed: reqJson.equallySpeed,
                                calorieCount: reqJson.calorieCount,
                                kilometerCount: reqJson.kilometerCount,
                                equallyPace: reqJson.equallyPace,
                                durationCount: reqJson.durationCount,
                                type: type,
                                count: 1, //跑步次数
                                ranking: 0, //排名
                                countTime: new Date(),
                                startTime: startTime,
                                endTime: endTime
                            }
                            runningCountModel.create(_query);
                        }
                    }
                })
            },
            /*
              删除跑步结果035
              */
            delRunning: function(req, res) {
                var token = req.query.token;
                var userId = req.query.userId;
                var runningId = req.body.runningId;
                if (!token || !userId || !runningId) {
                    return res.send({
                        code: "6000",
                        message: '缺少参数'
                    });
                };
                runningModel.update({
                    _id: runningId
                }, {
                    $set: {
                        state: "0"
                    }
                }, function(err, doc) {
                    if (!err) {
                        return res.send({
                            code: "0000",
                            message: 'ok',
                            result: ""
                        });
                    } else {
                        return res.send({
                            code: "6001",
                            message: '没有找到要删除的数据',
                            result: err
                        })
                    }
                });
            }
        }
        return fn
    })();