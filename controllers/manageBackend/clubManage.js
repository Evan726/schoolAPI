var util = require('../../utils/util.js');
var clubModel = require('../../models/club');
var activityModel = require('../../models/activity');
var userModel = require('../../models/user');
var mongoose = require("mongoose");
var common = require("./common");

module.exports = (function() {
	var fn = {
		getClubList: function(req, res) {
			common.managerVerify(req, res, function(staff){
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;

				if (!req.body.schoolId) {
					return common.error(res, "6000", "参数值错误");
				}

				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = clubModel.find({
					schoolId: mongoose.Types.ObjectId(req.body.schoolId),	// TODO:我这里是测试，正式是没有这个的
				},{
					name:1,
					clubNo:1,
					createTime:1,
					adminId:1
				});
				_query.populate([{
					path: 'adminId',
					select: {
						nickName: 1
					},
					model: "schoolUser"
				}]);
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {
						queryMemberCount(req, res, req.body.schoolId, doc);
					} else {
						common.errorPrint(res, "6001", err, "clubmanage.getClubList", "查询失败");
					}
				})
			});
			

			function queryMemberCount(req, res, schoolId, data){
				userModel.aggregate(
					[
						{
							$match:{
								schoolId:mongoose.Types.ObjectId(schoolId)
							}
						}, {
							$group:{_id:"$clubId", memberCount:{$sum:1}
						}
					}],
					function(err, doc){
						if (err) {
							common.errorPrint(res, "6001", err, "clubmanage.queryMemberCount", "查询失败");
						}else{
							var ret = [];
							data.forEach(function(value,index){	// 由于value.memberCount = getValueFromArray(doc, value._id);不能实现
								var temp = {};					// 所以此麻烦实现，后期查找原因
								temp._id = value._id;
								temp.clubNo = value.clubNo;
								temp.name = value.name;
								temp.createTime = value.createTime;
								temp.nickName = value.adminId.nickName;
								temp.memberCount = getValueFromArray(doc, value._id);
								ret[index] = temp;
							})

							queryActivityCount(req, res, req.body.schoolId, ret);
						}
					}
				);
			}

			function queryActivityCount(req, res, schoolId, data){
				activityModel.aggregate(
					[
						{
							$match:{
								schoolId:mongoose.Types.ObjectId(schoolId)
							}
						},
						{
							$group:{
								_id:"$clubId", memberCount:{$sum:1}
							}
						}
					]
					,function(err, doc){
						if (err) {
							common.errorPrint(res, "6001", err, "clubmanage.queryActivityCount", "查询失败");
						}else{
							var ret = [];
							data.forEach(function(value,index){	// 由于value.memberCount = getValueFromArray(doc, value._id);不能实现
								var temp = {};					// 所以此麻烦实现，后期查找原因
								temp._id = value._id;
								temp.clubNo = value.clubNo;
								temp.name = value.name;
								temp.createTime = value.createTime;
								temp.psnInCharge = value.nickName;	// person in charge 负责人
								temp.memberCount = value.memberCount;
								temp.activityCount = getValueFromArray(doc, value._id);
								ret[index] = temp;
							})
							common.sendData(res, "0000", ret, "0k");
						}
					}
				);
			}

			function getValueFromArray(doc, _id){
				for(var o in doc){
					if (_id.toString() === doc[o]._id.toString()) {
						return doc[o].memberCount;
					}
				}
				return 0;
			}
		}
	}
	return fn;
})();