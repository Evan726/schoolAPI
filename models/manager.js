var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户表
var managerSchema = new Schema({
	username: {
		type: String,
		required: true
	},
	password: { //密码
		type: String,
		required: true
	},
	resetPassword: { //密码
		type: String,
		required: true
	},
	mobile: {
		type: String
	}, //手机号码
	token: { //token
		type: String,
		//required: true
	},
	sex: String, //性别  1:为男  0位女
	lastLoginTime: {
		type: Date,
		default: Date.now
	}, //最后登录时间
	enabled:{
		type:Number,
		default:1
	}
});

module.exports = mongoose.model('managers', managerSchema);