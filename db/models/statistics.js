const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let statisticsSchema = new mongoose.Schema({
    loyalityId: {
        type: String,
        required: false,
        trim: true,
        minlenght: 2
    },
    activeCustomers: {
        type: Number,
        required: true,
        trim: true
    },
    rewardedCustomers: {
        type: Number,
        required: true,
        trim: true
    },
    customersWithOnePunch: {
        type: Number,
        required: true,
        trim: true
    },
    punches: {
        type: Object,
        required: true,
        trim: true
    }
});
statisticsSchema.methods.toJSON = function () {
    let statistics = this;
    let statisticsObject = statistics.toObject();
    return _.pick(statisticsObject, ['_id', 'loyalityId', 'activeCustomers', 'rewardedCustomers', 'punches']);
}


let statistics = mongoose.model('statistics', statisticsSchema);

module.exports = { statistics }