var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//活动成员表
var activityMemberSchema = new Schema({

	activityId: {
		type: Schema.Types.ObjectId,
		ref: "activity",
		require: true
	},
	memberId: { //成员id  userid
		type: Schema.Types.ObjectId,
		required: true
	},
	signType: { //签到类型  0为报名 1为签到
		type: String,
		default: 0
	},
	enrollTime: {
		type: Date
	},
	lat: Number,
	lag: Number,
	signAddress: String,
	isEffective: {
		type: String,
		required: true,
		default: 0
	},
	signTime: {
		type: Date
	}

});

module.exports = mongoose.model('activityMember', activityMemberSchema);