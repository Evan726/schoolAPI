var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var schoolSchema = new Schema({
	schoolNo: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	createTime: {
		type: Date,
		default: Date.now
	},
	contractDate:{
		type:Date,
		required:false
	},
	status:{
		type:Number,
		required:true
	},
	mobile:{
		type:String,
		required:false
	},
	contact:{
		type:String,
		required:true
	}
})

module.exports = mongoose.model("school", schoolSchema);