const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const SegmentsSchema = new mongoose.Schema({
	merchant: {
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Merchant'
	},
	segmentType:{
		type: String,
		required: true,
		trim:true,
		//unique: true
	},
	segmentData:{
       type:Object
	},
	updatedAt: {
		type: Date,
		required: true,
		default: Date.now
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

SegmentsSchema.methods.toJSON = function () {
	let Segments = this;
	let SegmentsObject = Segments.toObject();
	return _.pick(SegmentsObject, ['_id','segmentType','segmentData','updatedAt','createdAt']);
}

const Segment = mongoose.model('Segments', SegmentsSchema);

module.exports = Segment