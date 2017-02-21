var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户表
var studentBasicInfoSchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	studentNo: {
		type: String,
		required: true
	},
	nickName: {
		type: String,
	},
	specialty: {
		type: String, //专业
	},
	department: {
		type: String, //系
	},
	grade: {
		type: String, //年级
	},
	classNo: String,
	isEnroll: {
		type: Number,
		defalut: 0
	}
});
module.exports = mongoose.model('studentBasicInfos', studentBasicInfoSchema);