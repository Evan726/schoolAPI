var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//跑步轨迹
var runningNodeSchema = new Schema({

	runningId: {
		type: Schema.Types.ObjectId,
		required: true
	},
	speed: {
		type: String,
		default: 0,
		required: true
	},
	calorie: {
		type: Number,
		default: 0,
		required: true
	},
	kiometer: {
		type: Number,
		default: 0,
		required: true
	},
	pace: {
		type: Number,
		default: 0,
		required: true
	},
	duration: {
		type: Number,
		default: 0,
		required: true
	},
	color: {
		type: String,
		default: 0
	},
	nowDate: {
		type: Date,
		required: true
	},
	isKilometerNode: {
		type: String,
		required: true
	},
	lat: {
		type: Number,
		required: true
	},
	lag: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('runningNode', runningNodeSchema);