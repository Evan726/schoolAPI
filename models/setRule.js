var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var setRuleSchema = new Schema({
	schoolId: { //学校id
		type: Schema.Types.ObjectId,
		required: true
	},
	targetCredits: Number, //目标学分
	excellentCredit: Number, //优秀所需学分
	passCredit: Number, //及格所需学分
	creditKiometer: Number, //1公里所得积分
	creditActivity: Number, //1次活动所得积分
	bigCreditActivity: Number, //活动上线分
	smallSpeed: Number, //最小配速
	bigSpeed: Number, //最大配速
	lastSemesterStartTime: Number, //上学期开始月份
	lastSemesterEntTime: Number, //上学期结束月份
	nextSemesterStartTime: Number, //下学期开始月份
	nextSemesterEndTime: Number, //下学期结束月份
	createTime: {
		type: Date,
		default: Date.now
	}
});

module.exports = mongoose.model("setRule", setRuleSchema);