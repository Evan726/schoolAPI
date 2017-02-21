var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//用户表
var userSchema = new Schema({
	studentNo: String,
	schoolId: {
		type: Schema.Types.ObjectId,
	}, //学校编号
	clubId: {
		type: Schema.Types.ObjectId
	},
	//locationId: Schema.Types.ObjectId,
	password: { //密码
		type: String,
		required: true
	},
	token: { //token
		type: String,
		required: true
	},
	mobile: {
		type: String,
		required: true
	}, //手机号码
	deviceId: String, //手机设备iD
	nickName: String, //名称
	headImg: String, //头像
	sex: String, //性别  1:为男  0位女
	birthday: String,
	height: { //身高
		type: Number,
		default: 0
	},
	admission: String, //入学时间
	weight: { //体重
		type: Number,
		default: 0
	},
	lat: Number,
	lag: Number,
	lastLoginTime: {
		type: Date,
		default: Date.now
	}, //最后登录时间
	enrollTime: {
		type: Date
	},
	createTime: {
		type: Date,
		default: Date.now
	}, //最后登录时间
	enabled:{
		type:Number,
		default:1
	}
});

module.exports = mongoose.model('user', userSchema);