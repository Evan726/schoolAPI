var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var runningCountSchema = new Schema({

	userId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	equallySpeed: {
		type: String,
		default: 0,
		required: true
	},
	calorieCount: {
		type: Number,
		default: 0,
		required: true
	},

	kilometerCount: {
		type: Number,
		default: 0,
		required: true
	},
	equallyPace: {
		type: Number,
		default: 0,
		required: true
	},
	durationCount: {
		type: Number,
		default: 0,
		required: true
	},
	count: {
		type: Number,
		default: 0,
		required: true
	},
	ranking: {
		type: Number,
		required: true,
		default: 0
	},

	type: {
		type: String,
		required: true,
		default: 0
	},
	countTime: {
		type: Date,
		required: true
	},
	startTime: String, //上学期开始月份
	endTime: String, //上学期结束月份
	createTime: {
		type: Date,
		default: Date.now
	}

});

module.exports = mongoose.model('runningCount', runningCountSchema);