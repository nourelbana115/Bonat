const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let CouponStatisticsSchema = new mongoose.Schema({
    idCampaign: {
        type: String,
        required: true,
        trim: true,
    },
    idMerchant: {
        type: String,
        required: true,
        trim: true,
    },
    initialPrice: {
        type: String,
        required: true,
        trim: true,
    },
    newPrice: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: String,
        required: true,
        trim: true,
    },
    couponsAmount: {
        type: Number,
        required: true,
        trim: true,
    },
    customerPerCoupon: {
        type: Number,
        required: true,
        trim: true,
    },
    activeAfterPurchased: {
        type: Number,
        required: true,
        trim: true,
    },
    leftCoupons: {
        type: Number,
        required: true,
        trim: true,
    },
    expiredCoupons: {
        type: Number,
        required: true,
        trim: true,
    },
    usedCoupons: {
        type: Number,
        required: true,
        trim: true,
    },
    purchasedCoupons: {
        type: Number,
        required: true,
        trim: true,
    },
    createdAt: {
		type: Date,
		required: false,
		trim: true
    },
    expirationDate: {
		type: Date,
		required: false,
		trim: true
    },
    isActive: {
		type: Boolean,
		required: true
    },
    lastUpdate:{
        type: Date,
		required: true,
		trim: true
    },
    statCreatedAt: {
        type: Date,
		default: Date.now,
		trim: true
    },
    statUpdatedAt: {
        type: Date,
		default: Date.now,
		trim: true
    }
});
CouponStatisticsSchema.methods.toJSON = function () {
    let statistics = this;
    let statisticsObject = statistics.toObject();
    return _.pick(statisticsObject, [
        '_id',
        'idCampaign',
        'initialPrice',
        'newPrice',
        'discount',
        'couponsAmount',
        'customerPerCoupon',
        'activeAfterPurchased',
        'leftCoupons',
        'expiredCoupons',
        'usedCoupons',
        'purchasedCoupons',
        'createdAt',
        'expirationDate',
        'is_active',
        'lastUpdate'
    ]);
}


let CouponStatistics = mongoose.model('CouponStatistics', CouponStatisticsSchema);

module.exports = { CouponStatistics }