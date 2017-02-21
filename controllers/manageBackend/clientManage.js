var util = require('../../utils/util.js');
var schoolModel = require("../../models/school");
var schoolUserModel = require('../../models/schoolUser');
var mongoose = require("mongoose");
var common = require("./common");
module.exports = (function() {
	var fn = {
		getSchoolNames: function(req, res) {
			common.managerVerify(req, res, function(staff){
				var _query = schoolModel.find({},{
					schoolId:1, 
					name:1
				});
				_query.exec(function(err, doc) {
					if (!err) {
						common.sendData(res, "0000", data, "ok");
					} else {
						return common.errorPrint(res, "6001", err, "clientmanage.getSchoolNames", "查询失败");
					}
				})
			});
		},
		addClientItem:function(req, res){
			common.managerVerify(req, res, function(){
				var body  = req.body;
				if (!body.username || !body.schoolId) {
					return common.error(res, "6000", "缺少参数");
				}
				if (!typeof body.username == "string") {
					return common.error(res, "6000", "参数值类型错误");
				}

				schoolUserModel.count({
					$and:[
							{
								schoolId: mongoose.Types.ObjectId(body.schoolId)
							},
							{
								group:1
							}
						]
					},function(err, cnt){
					if (err) {
						common.errorPrint(res, "6001", err, "clientManage.addClientItem", "新增失败");
					}else{
						if (cnt >=1) {
							common.errorPrint(res, "6001", "学校管理员超出限制", "clientManage.addClientItem", "学校管理员超出限制");
						}else{
							insertItem(body);
						}
					}
				});
			});


			
			function insertItem(body){
				var addItem = {
					username: body.username,
					schoolId: mongoose.Types.ObjectId(body.schoolId),
					group: 1
				};
				if (body.nickName) {
					addItem.nickName = body.nickName;
				}
				if (body.mobile) {
					addItem.mobile = body.mobile;
				}
				addItem.password = util.md5("000000").toUpperCase();
				schoolUserModel.create(addItem, function(err, doc) {
					if (!err && !!doc) {
						common.sendData(res, "0000", doc, "0k");
					}else{
						common.errorPrint(res, "6001", err, "clientManage.addClientItem", "新增失败");
					}
				});
			}
		},
		getClientList:function(req, res){
			common.managerVerify(req, res, function(){
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;

				if (!req.body.schoolId) {
					return common.error(res, "6000", "缺少参数");
				}

				var qc = req.body.username ? {
					$and:[
						{
							username:req.body.username
						},{
							schoolId:mongoose.Types.ObjectId(req.body.schoolId)
						}
					]
				}
					: {
						schoolId:mongoose.Types.ObjectId(req.body.schoolId)
					};
				var _query = schoolUserModel.find(qc,{
					username:1,
					nickName:1,
					sex:1,
					mobile:1,
					group:1,
					schoolId:1,
					enabled:1
				});
				_query.populate([{
					path: 'schoolId',
					select: {
						name: 1
					},
					model: "school"
				}]);
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {
						return common.sendData(res, "0000", doc, "ok");
					} else {
						return common.errorPrint(res, "6001", err, "clientmanage.getClientList", "查询失败");
					}
				});
			});
		},
		resetClientPasword:function(req, res){
			common.managerVerify(req, res, function(){
				if (!req.body.schoolUserId) {
					return common.error(res, "6000", "缺少参数");
				}

				var setOpt = {
					password:util.md5("000000").toUpperCase()
				};
				schoolUserModel.update({
					_id:mongoose.Types.ObjectId(req.body.schoolUserId)
				}, {
					$set:setOpt
				},
				function(err, doc){
					if (err) {
						common.errorPrint(res, "6002", err, "clientmessage.resetClientPasword", "修改失败");
					}else{
						common.sendData(res, "0000", "更新成功", "ok");
					}
				});
			});
		},
		updateClientStatus:function(req, res){
			common.managerVerify(req, res, function(){
				if (!req.body.schoolUserId || !req.body.optType) {
					return common.error(res, "6000", "缺少参数");
				}

				if (req.body.optType != 1 && req.body.optType != 0) {
					return common.error(res, "6000", "参数错误");
				}

				var setOpt = {
					enabled:req.body.optType
				};
				schoolUserModel.update({
					_id:mongoose.Types.ObjectId(req.body.schoolUserId)
				}, {
					$set:setOpt
				},
				function(err,doc){
					if (err) {
						common.errorPrint(res, "6002", err, "clientmessage.resetClientPasword", "修改失败");
					}else{
						common.sendData(res, "0000", "更新成功", "0k");
					}
				});
			});

		}
	}
	return fn;
})();