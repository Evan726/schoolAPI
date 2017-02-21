var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//活动表
var activitySchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId,
	},
	clubId: {
		type: Schema.Types.ObjectId,
		ref: "clubs",
		require: true
	},
	title: {
		type: String,
		required: true
	},
	introductionUrl: { //活动url
		type: String,
		required: true
	},
	startDate: { //开始时间
		type: Date,
		required: true
	},
	endDate: { //结束时间
		type: Date,
		required: true
	},
	address: { //活动地址
		type: String,
		required: true
	},
	kilometer: { //公里数
		type: Number,
		required: true
	},
	peopleNumber: { //人数
		type: Number,
		required: true
	},
	publisher: { //发布者
		type: String,
		required: true
	},
	logoImgUrl: String, //活动图片
	activityType: { //活动类型
		type: String,
		required: true
	}, //0跑步 1其他
	memberType: {
		type: String,
		required: true
	},
	lat: Number,
	lag: Number,

	signEndDate: { //签到时间
		type: Date,
	},
	isSign: { //是否签到
		type: String
	},
	isEnroll: {
		type: String
	},
	isPay: { //是否支持支付
		type: String
	},

	totalFee: String, //支付金额
	createTime: {
		type: Date,
		default: Date.now
	},
	enrollCount: {
		type: Number,
		default: 0
	},
	signCount: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('activity', activitySchema);