var userGradeModel = require('../../models/userGrade');
var mongoose = require("mongoose");
var common = require("./common");

module.exports = (function() {
	var fn = {
		getDefaultLevelList:function(req, res){
			common.managerVerify(req, res, function(staff){
				userGradeModel.find({schoolId:{$exists:false}}, function(err, doc){
					if (err) {
						return common.errorPrint(res, "6001", err, "levelManage.getDefaultLevelList", "查询失败");
					}else{
						return common.sendData(res, "0000", doc, "0k");
					}
				});
			});
		},
		updateDefaultLevelItem:function(req, res){
			common.managerVerify(req, res, function(staff){
				var flag = isParamsValid(req, res);
				if (!flag) {return;}
				var setOpt = {
					type:1,
					kilometer1 : req.body.kilometer1,
					title1 : req.body.title1,
					kilometer2 : req.body.kilometer2,
					title2 : req.body.title2,
					kilometer3 : req.body.kilometer3,
					title3 : req.body.title3,
					kilometer4 : req.body.kilometer4,
					title4 : req.body.title4,
					kilometer5 : req.body.kilometer5,
					title5 : req.body.title5,
					title6 : req.body.title6,
				}
				if (req.body.levelId) {
					userGradeModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.body.levelId),{$set:setOpt}, function(err, doc){
						if (err) {
							common.errorPrint(res, "6001", err, "levelManage.updateDefaultLevel", "更新失败");
						}else{
							setOpt.levelId = req.body.levelId;
							common.sendData(res, "6001", setOpt, "0k");

						}
					})
				}else{
					userGradeModel.create(setOpt, function(err, doc){
						if (err) {
							common.errorPrint(res, "6001", err, "levelManage.updateDefaultLevel", "更新失败");
						}else{
							common.sendData(res, "6001", setOpt, "0k");
						}
					})
				}
			});

			function isParamsValid(req, res){
				var body = req.body;
				if (!body.kilometer1 || !body.title1 || !body.kilometer2 || !body.title2 || 
					!body.kilometer3 || !body.title3 || !body.kilometer4 || !body.title4 ||
					!body.kilometer5 || !body.title5 || !body.title6) {
					common.error(res, "6001", "参数错误");
					return false;
				}
				if (!typeof body.kilometer1 == "number" || !typeof body.title1 == "string" || 
					!typeof body.kilometer2 == "number" || !typeof body.title2 == "string" || 
					!typeof body.kilometer3 == "number" || !typeof body.title3 == "string" || 
					!typeof body.kilometer4 == "number" || !typeof body.title4 == "string" ||
					!typeof body.kilometer5 == "number" || !typeof body.title5 == "string" || 
					!typeof body.title6 == "string") {
					common.error(res, "6001", "参数类型错误");
					return false;
				}
				return true;
			}					
		}
	}
	return fn;
})();