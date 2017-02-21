var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户等级表
var userGradeSchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId
	},
	kilometer1: { //公里数
		type: Number,
		default: 0,
		required: true
	},
	title1: { //等级名称
		type: String,
		required: true
	},
	kilometer2: { //公里数
		type: Number,
		default: 0,
		required: true
	},
	title2: { //等级名称
		type: String,
		required: true
	},
	kilometer3: { //公里数
		type: Number,
		default: 0,
		required: true
	},
	title3: { //等级名称
		type: String,
		required: true
	},
	kilometer4: { //公里数
		type: Number,
		default: 0,
		required: true
	},
	title4: { //等级名称
		type: String,
		required: true
	},
	kilometer5: { //公里数
		type: Number,
		default: 0,
		required: true
	},
	title5: { //等级名称
		type: String,
		required: true
	},
	title6: { //等级名称
		type: String,
		required: true
	},
	type: {
		type: Number,
		default: 0
	}
});

module.exports = mongoose.model('userGrade', userGradeSchema);