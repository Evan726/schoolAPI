var schoolModel = require("../../models/school");
var mongoose = require("mongoose");
var common = require("./common");

module.exports = (function() {
	var fn = {
		getSchoolList:function(req, res){
			common.managerVerify(req, res, function(staff){
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				if (!typeof pageCount == "number" || !typeof rows == "number") {
					common.error(res, "6000", "参数值类型错误");
				}
				
				var schoolName = req.body.name ? {name:req.body.name} : {};
				var querys = schoolModel.find(schoolName,{schoolNo:1, name:1, createTime:1, contractDate:1, status:1, contact:1, mobile:1});
				querys.skip((pageCount - 1) * rows);
				querys.limit(rows);
				querys.exec(function(err, doc){
					if (!err && !!doc) {
						common.sendData(res, "0000", doc, "0k");
					}else{
						common.errorPrint(res, "6001", err, "schoolManage.getSchoolList", "查询失败");
					}
				});
			});
		},
		addSchoolItem:function(req, res){	//创建学校
			common.managerVerify(req, res, function(staff){
				isAddFuncParamsValid(req, res);

				schoolModel.count({
					$or:[{schoolNo: req.body.schoolNo},{name: req.body.name}]
				},function(err,cnt){
					if (err) {
						common.errorPrint(res, "6002", err, "schoolManage.addSchoolItem", "新增失败");	
					}else{
						if (cnt >= 1) {
						common.errorPrint(res, "6001", err, "schoolManage.addSchoolItem", "学校已经存在");	
						}else{
							insertItem();
						}
					}
				});
			});

			function insertItem(){

				var addItem = {
				schoolNo: req.body.schoolNo,
				name: req.body.name,
				status: req.body.status,
				contact:req.body.contact
				};
				if (req.body.mobile) {
					addItem.mobile = req.body.mobile;
				}
				if (req.body.contractDate) {
					addItem.contractDate = req.body.contractDate;
				}
				
				schoolModel.create(addItem, function(err, doc) {
					if (!err && !!doc) {
						common.sendData(res, "0000", doc, "ok");
					}else{
						common.errorPrint(res, "6002", err, "schoolManage.insertItem", "新增失败");
					}
				})		
			}

			function isAddFuncParamsValid(req, res){
				var body = req.body;
				if (!body.name || !body.status || !body.contact) {
					return common.error(res, "6001", "缺少参数");
				}

				if (!typeof body.name == "string" || !typeof body.contact == "string" || !typeof body.status == "number") {
					return common.error(res, "6000", "缺少参数");
				}

				if ((body.mobile && !typeof body.mobile == "string") 
					|| (body.contractDate && !typeof body.contractDate == "date")) {
					return common.error(res, "6000", "参数值类型错误");
				}
			}
		},
		
		getSchoolItem:function(req, res){
			common.managerVerify(req, res, function(staff){
				if (!req.body.schoolId) {
					return common.error(res, "6001", "缺少参数");
				}

				schoolModel.find({_id:mongoose.Types.ObjectId(req.body.schoolId)}, function(err,doc){
					if (err) {
						common.errorPrint(res, "6001", err, "schoolManage.getSchoolItem", "查询失败");
					}else{
						common.sendData(res, "0000", doc, "ok");
					}
				});
			});
		},
		updateSchoolItem:function(req, res){
			common.managerVerify(req, res, function(staff){
				isUpdateParamsValid(req, res);

				var setOpt = {
					status : req.body.status,
					contact : req.body.contact,
				}
				if (req.body.mobile) {
					setOpt.mobile = req.body.mobile;
				}
				if (req.body.contractDate) {
					setOpt.contractDate = req.body.contractDate;
				}
				schoolModel.update({_id:mongoose.Types.ObjectId(req.body.schoolId)}, 
									{$set:setOpt}, function(err, doc){
					if (!err || !!doc) {
						common.sendData(res, "0000", "更新成功", "ok");
					}else{
						common.error(res, "6002", err, "schoolManage.updateSchoolItem", "修改失败");
					}
				});
			});
			

			function isUpdateParamsValid(req, res){
				var body = req.body;
				if (!body.schoolId || !body.status || !body.contact) {
					return common.error(res, "6001", "缺少参数");
				}

				if (!typeof body.status == "number" || !typeof body.contact == "string") {
					return common.error(res, "6000", "参数值类型错误");
				}

				if ((body.mobile && !typeof body.mobile == "string") 
					|| (body.contractDate && !typeof body.contractDate == "date")) {
					return common.error(res, "6000", "参数值类型错误");
				}
			}
		},
	}
	return fn;
})();