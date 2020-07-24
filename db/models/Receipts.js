const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let ReceiptsSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	receiptId: {
		type: Number,
		required: true,
		trim: true
	},
	date: {
		type: Date,
		required: true,
		trim: true
	},
	total: {
		type: Number,
		required: true,
		trim: true
	},
	items: {
		type: Array,
		required: true,
	}
});

ReceiptsSchema.methods.toJSON = function(){
	let Receipts = this;
	let ReceiptsObject = Receipts.toObject();
	return _.pick(ReceiptsObject, ['_id','idMerchant','receiptId','date','total','items']);
}


let Receipts = mongoose.model('Receipts', ReceiptsSchema);

module.exports = {Receipts}