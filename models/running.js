var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//跑步
var runningSchema = new Schema({
	activityId: {
		type: Schema.Types.ObjectId
	}, //活动id, 跑步俱乐部活动使用
	calorieCount: {
		type: Number,
		default: 0,
		required: true
	},
	kilometerCount: {
		type: Number,
		default: 0,
		required: true
	}, //公里数
	durationCount: {
		type: Number,
		default: 0,
		required: true
	}, //时长	
	equallySpeed: {
		type: String,
		default: 0,
		required: true
	}, //平均配速
	equallyPace: {
		type: Number,
		default: 0,
		required: true
	}, //平均时速
	highPace: {
		type: Number,
		default: 0,
		required: true
	}, //最高时速
	lowPace: {
		type: Number,
		default: 0,
		required: true
	}, //最低时速
	userId: { //userid
		type: Schema.Types.ObjectId,
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

	isEffective: {
		type: String,
		required: true,
		default: 1
	},
	state: {
		type: String,
		default: 1
	},
	createTime: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model('running', runningSchema);