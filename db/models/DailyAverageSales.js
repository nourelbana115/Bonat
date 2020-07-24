const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let DailyAverageSalesSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	date: {
		type: Date,
		required: true,
		trim: true
	},
	average: {
		type: Number,
		required: true,
		trim: true
	},
	total: {
		type: Number,
		required: true,
		trim: true
	},
	receiptsNumber: {
		type: Number,
		required: true,
		trim: true
	},
	customerIds: {
		type: Array,
		required: true,
	}
});

DailyAverageSalesSchema.methods.toJSON = function(){
	let DailyAverageSales = this;
	let DailyAverageSalesObject = DailyAverageSales.toObject();
	return _.pick(DailyAverageSalesObject, ['_id','idMerchant','date','average','total','receiptsNumber','customerIds']);
}


let DailyAverageSales = mongoose.model('DailyAverageSales', DailyAverageSalesSchema);

module.exports = {DailyAverageSales}