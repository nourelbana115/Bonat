const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const SegmentStatisticsSchema = new mongoose.Schema({
	segment: {
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Segment'
	},
	userCount:{
		type: Number,
		required: true
	},
	percentageDiff:{
       type:Number,
       required: true,
	},
	percentageOfSegment:{
		type:Number,
		required: true,
	 },
	createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}
});

SegmentStatisticsSchema.methods.toJSON = function () {
	let SegmentsStatistics = this;
	let SegmentsStatisticsObject = SegmentsStatistics.toObject();
	return _.pick(SegmentsStatisticsObject, ['_id','segment','userCount','percentageDiff','createdAt']);
}

const SegmentStatistics = mongoose.model('SegmentStatistics', SegmentStatisticsSchema);

module.exports = {SegmentStatistics};