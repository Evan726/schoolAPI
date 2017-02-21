var util = require('../../utils/util.js');
var userModel = require('../../models/user');
var mongoose = require("mongoose");
var common = require("./common");

module.exports = (function() {
	var fn = {
		//俱乐部列表
		getPlayerList: function(req, res) {
			common.managerVerify(req, res, function(staff){
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				
				if (!req.body.schoolId) {
					return common.error(res, "6000", "缺少参数");
				}
				var qc = req.body.account ? {
					$and:[
						{
							schoolId: mongoose.Types.ObjectId(req.body.schoolId)
						},
						{
							$or:[
								{mobile:req.body.account},
								{studentNo:req.body.account}
							]
						}]}
				: {schoolId: mongoose.Types.ObjectId(req.body.schoolId)};
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = userModel.find(qc,{schoolId:1, nickName:1, sex:1, studentNo:1, mobile:1, enrollTime:1, enabled:1});
				_query.populate([{
					path: 'schoolId',
					select: {name: 1},
					model: "school"
				}]);
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {
						var ret = [];
						doc.forEach(function(value,index){
							var temp = {};
							temp._id = value._id
							temp.schoolId = value.schoolId
							temp.account = value.mobile
							temp.nickName = value.nickName
							temp.sex = value.sex
							temp.studentNo = value.studentNo
							temp.enrollTime = value.enrollTime
							temp.status = value.enabled
							temp.schoolName = value.schoolId.name;
							if (value.studentNo) {
								temp.playerType = "校园";
							}else{
								temp.playerType = "普通";
							}
							ret[index] = temp;
						});
						queryPlayerCount(req, res, ret);
					} else {
						common.errorPrint(res, "6001", err, "playermanage.getPlayerList", "查询失败");
					}
				})
			});

			function queryPlayerCount(req, res, data){
				userModel.count({
					schoolId: mongoose.Types.ObjectId(req.body.schoolId),
				}, function(err, cnt){
					if (err) {
						common.errorPrint(res, "6001", err, "playermanage.queryPlayerCount", "查询失败");
					}else{
						var ret = {};
						ret.allcount = cnt;
						ret.detail = data;
						common.sendData(res, "0000", ret, "ok");
					}
				});
			}
		},

		updatePlayerAccountStatus:function(req,res){
			common.managerVerify(req, res, function(staff){
				if (!req.body.userId || !req.body.optType) {
					return common.error(res, "6000", "缺少参数");
				}

				if (req.body.optType != 1 && req.body.optType != 0) {
					return common.error(res, "6000", "参数错误");
				}
				userModel.update({_id:mongoose.Types.ObjectId(req.body.userId)}, {$set:{enabled:req.body.optType}}, function(err, doc){
					if (!err || !!doc) {
						common.sendData(res, "0000", doc._id, "ok");
					}else{
						common.errorPrint(res, "6002", err, "playermanage.updatePlayerAccountStatus", "修改失败");
					}
				});
			});
		},

		tctid:function(req, res){
			var qc = {_id:mongoose.Types.ObjectId("585361565119e305f0b49c48")}
			var _query = userModel.find(qc);
			_query.populate([{
						path:''
					}
				]);
			}

		}
	
	return fn;
})();