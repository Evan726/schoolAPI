var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var school = require('./school.js');
var clubSchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId,
		ref: 'school'
	},
	adminId: {
		type: Schema.Types.ObjectId,
		ref: 'schoolUser'
	},
	logo: String,
	name: {
		type: String,
		require: true
	},
	clubNo: {
		type: String,
		require: true
	},
	content: String,
	createTime: {
		type: Date,
		default: Date.now
	}
})

module.exports = mongoose.model('clubs', clubSchema);