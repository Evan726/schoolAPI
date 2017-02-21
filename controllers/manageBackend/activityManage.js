var util = require('../../utils/util.js');
var activityModel = require('../../models/activity');
var activityMemberModel = require('../../models/activityMember');
var mongoose = require("mongoose");
var common = require("./common");
module.exports = (function() {
	var fn = {
		//俱乐部列表
		getActivityList: function(req, res) {
			common.managerVerify(req, res, function(staff){
				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;

				if (!req.body.schoolId) {
					return common.error(res, "6000", '参数值类型错误');
				}

				var pageCount = req.body.pageCount || 1;
				var rows = req.body.rows || 20;
				var _query = activityModel.find({
					schoolId: mongoose.Types.ObjectId(req.body.schoolId),	// TODO:我这里是测试，正式是没有这个的
				},{
					title:1,
					address:1,
					clubId:1,
					activityType:1,
					isSign:1,
					isEnroll:1,
					isPay:1,
					totalFee:1,
					endDate:1,
					startDate:1,
					activityType:1,
					totalFee:1
				});
				_query.populate([{
					path: 'clubId',
					select: {
						adminId:1
					},
					model: "clubs",
					populate:{
						path:'adminId',
						select:{
							nickName:1
						},
						model:"schoolUser"
					}// end second populate
				}]); // end first populate
				_query.skip((pageCount - 1) * rows);
				_query.limit(rows);
				_query.exec(function(err, doc) {
					if (!err) {
						queryJoinCount(req,res,doc);
					} else {
						return common.errorPrint(res, "6001", err, "activitymanage.getActivityList", "查询成员失败");
					}
				})
			});
			

			function queryJoinCount(req, res, data){
				var activityIDs = [];
				data.forEach(function(value,index){
					activityIDs[index] = value._id;
				})
				activityMemberModel.aggregate(
					[
						{
							$match:{
								activityId:{$in:activityIDs}
							}
						}, {
							$group:{
								_id:"$activityId",
								cnt:{
									$sum:1
								}
							}
						}
					],
					function callback(err, doc){
					if (err) {
						return common.errorPrint(res, "6001", err, "activitymanage.queryMemberCount", "查询失败");
					}else{
						querySignCount(req, res, data, doc);
					}
				});
			}

			function querySignCount(req, res, data, jc){
				var activityIDs = [];
				var index = 0;
				data.forEach(function(value){ 
					if (value.isSign) {
						activityIDs[index] = value._id;
					}
				});
				activityMemberModel.aggregate([
						{
							$match:{
								$and:[
										{
										signType:{
											$exists:true}
										},		// TODO:bug bug bug
										{
											activityId:{
												$in:activityIDs
											}
										}
									]
								}
						},
						{$group:{_id:"$activityId", cnt:{$sum:1}}}
					],function(err, doc){
						if (err) {
							return common.errorPrint(res, "6001", err, "activitymanage.querySignCount", "查询失败");
						}else{
							var now = new Date();
							var ret = [];
							data.forEach(function(value, index){
								var temp = {};
								temp._id = value._id;
								temp.title = value.title;
								temp.startDate = value.startDate;
								temp.address = value.address;
								temp.psnInCharge = value.clubId.adminId.nickName;
								temp.activityType = value.activityType;
								temp.totalFee = value.totalFee;
								temp.status = value.endDate > now ? "进行中" : "已结束";
								temp.memberCount = getValueFromArray(jc,value._id);
								if (value.isSign) {
									temp.signCount = getValueFromArray(doc, value._id);
								}else{
									temp.signCount = temp.memberCount;
								}
								ret[index] = temp;
							});
							common.sendData(res, "0000", ret, "ok");
						}

					}
				);
			}

			function getValueFromArray(doc, _id){
				for(var o in doc){
					if (_id.toString() === doc[o]._id.toString()) {
						return doc[o].cnt;
					}
				}
				return 0;
			}
		}
	}
	return fn;
})();