var activityTypeModel = require('../../models/activityType');
var mongoose = require("mongoose");
var common = require("./common");
module.exports = (function() {
	var fn = {
		addActivitytypesItem:function(req, res){
			common.managerVerify(req, res, function(staff){
				if (!req.body.acName) {
					return common.error(res, "6001", "缺少参数");
				}

				if (!typeof req.body.acName == "string") {
					return common.error(res, "6000", "参数值类型错误");
								
				}

				var qc={};
				if (req.body.schoolId) {
					qc.schoolId = req.body.schoolId;
				}else{
					qc.schoolId = {$exists:false};
				}
				var _query = activityTypeModel.find(qc,{index:1});
				_query.sort({index:-1});
				_query.limit(1);
				_query.exec(function(err, doc){
					if (err) {
						common.errorPrint(res, "6001", err, "activityType.addActivitytypesItem", "新增失败");
					}else{
						insertItem(req, res, doc[0].index);
					}
				});
			});


			function insertItem(req, res, inputIndex){
				var addItem = {
					acName:req.body.acName,
					index:inputIndex+1
				}
				if (req.body.schoolId) {
					addItem.schoolId = req.body.schoolId;
				}
				activityTypeModel.create(addItem, function(err, doc){
					if (err) {
						common.errorPrint(res, "6001", err, "activityType.addActivitytypesItem", "新增失败");
					}else{
						common.sendData(res, "0000", doc, "新增成功");
					}
				});
			}
		},
		getActivityTypesList:function(req,res){
			common.managerVerify(req, res, function(staff){
				var qc={};
				if (req.body.schoolId) {
					qc.schoolId = req.body.schoolId;
				}else{
					qc.schoolId = {$exists:false};
				}

				activityTypeModel.find(qc, function(err,doc){
					if (err) {
						common.errorPrint(res, "6001", err, "activityType.getActivityTypesList", "查询失败");
					}else{
						common.sendData(res, "0000", doc, "ok");
					}
				});
			});
		},
		delActivityTypesItem:function(req, res){
			common.managerVerify(req, res, function(staff){
				if (!req.body.activityTypeId) {
					return common.error(res, "6001", "缺少参数");
				}

				if (!typeof req.body.activityTypeId) {
					return common.error(res, "6000", "参数值类型错误");	
				}

				activityTypeModel.remove({
					_id:mongoose.Types.ObjectId(req.body.activityTypeId)
				},function(err, doc){
					if (err) {
						common.errorPrint(res, "6001", err, "activityType.getActivityTypesList", "查询失败");
					}else{
						common.sendData(res, "0000", '成功删除', "ok");
					}
				})
			});
		}
	}
	return fn;
})();