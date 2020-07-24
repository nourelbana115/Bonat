const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const GiftStatisticsSchema = new mongoose.Schema({
    gift:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'Gift'
    },
    amountOfSentGifts: {
        type: Number,
        required: true,
        trim: true,
    },
    amountOfUsedGifts: {
        type: Number,
        required: true,
        trim: true,
    },
    percentageOfUsage: {
        type: Number,
        required: true,
        trim: true,
    },
    createdAt: {
		type: Date,
		required: true,
		default: Date.now
	}

});
GiftStatisticsSchema.methods.toJSON = function () {
    let statistics = this;
    let statisticsObject = statistics.toObject();
    return _.pick(statisticsObject, [
        '_id',
        'gift',
        'amountOfSentGifts',
        'amountOfUsedGifts',
        'percentageOfUsage',
        'createdAt'
    ]);
}


const GiftStatistics = mongoose.model('GiftStatistics', GiftStatisticsSchema);

module.exports = { GiftStatistics }