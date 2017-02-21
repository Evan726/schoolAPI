var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var verifyCodeSchema = new Schema({

	mobile: String, //手机
	verifyCode: String, //验证码
	serverMessage: String, //
	dateCreated: Date
});

module.exports = mongoose.model('verifyCode', verifyCodeSchema);