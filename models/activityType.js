var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var activityTypeSchema = new Schema({
	schoolId: {
		type: Schema.Types.ObjectId,
		ref: 'school'
	},
	index:{
		type:Number,
		require:true
	},
	acName:{
		type:String,
		require:true
	}

})

module.exports = mongoose.model('activitytypes', activityTypeSchema);