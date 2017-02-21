var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户表
var schoolUserSchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId,
	}, //学校编号
	username: {
		type: String,
		required: true
	},
	password: { //密码
		type: String,
		required: true
	},
	// resetPassword: { //密码
	// 	type: String,
	// 	required: true
	// },
	mobile: {
		type: String
	}, //手机号码
	token: { //token
		type: String,
		//required: true
	},
	nickName: String, //名称
	sex: String, //性别  1:为男  0位女
	clubId: {
		type: Array
	},
	group: { //1为超级管理员 2：普通管理员
		type: Number
	},
	lastLoginTime: {
		type: Date,
		default: Date.now
	}, //最后登录时间
	enabled:{
		type:Number,
		default:1
	}
});

module.exports = mongoose.model('schoolUser', schoolUserSchema);