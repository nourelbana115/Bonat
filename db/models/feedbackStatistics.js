const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let feedbackSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default:Date.now,
		trim: true
    },
    merchant: {
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Merchant'
	},
    type: {
        type: String,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    percentageDiff: {
        type: Number,
        required: true,
    },
   
});
feedbackSchema.methods.toJSON = function () {
    let feedback = this;
    let feedbackObject = feedback.toObject();
    return _.pick(feedbackObject, ['_id', 'createdAt','amount', 'merchant', 'type','label', 'percentage','percentageDiff']);
}


let feedback = mongoose.model('feedback', feedbackSchema);

module.exports = { feedback }