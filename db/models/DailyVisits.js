const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let dailyVisitSchema = new mongoose.Schema({
    visitDate: {
		type: Date,
        required: true,
        unique:true
    },
    merchant: {
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Merchant'
	},
    newCustomers: {
        type: Number,
        required: true,
        trim: true
    },
    returnCustomers: {
        type: Number,
        required: true,
        trim: true
    },
   
   
});
dailyVisitSchema.methods.toJSON = function () {
    let dailyVisit = this;
    let dailyVisitObject = dailyVisit.toObject();
    return _.pick(dailyVisitObject, ['_id', 'visitDate', 'newCustomers', 'returnCustomers']);
}


let DailyVisit = mongoose.model('DailyVisit', dailyVisitSchema);

module.exports = { DailyVisit }