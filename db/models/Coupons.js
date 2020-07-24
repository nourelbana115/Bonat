const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let CouponsSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	idCampaign: { // the same as idCampaign in BackEnd server.
		type: String,
		required: true,
		trim: true
	},
	startDate: {
		type: Date,
		required: true,
		trim: true
	},
	discount: {
		type: String,
		required: true,
		trim: true
	},
	createdAt: {
		type: Date,
		required: true,
		trim: true
	},
	latestUpdate: {
		type: Date,
		required: true,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	title_ar: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	description: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	description_ar: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	oldPrice: {
		type: String,
		required: true,
		trim: true
	},
	newPrice: {
		type: String,
		required: true,
		trim: true
	},
	expirationDate: {
		type: Date,
		required: true,
		trim: true
	},
	numAvailable: {
		type: Number,
		required: true,
		trim: true
	},
	idCampaignType: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	imageUrl: {
		type: Array,
		required: false
	},
	idCity: {
		type: Number,
		required: true,
		trim: true
	},
	maxOwner: {
		type: Number,
		required: true,
		trim: true
	},
	numOfValidDays: {
		type: Number,
		required: true,
		trim: true
	},
	dashboardData: {
		type: Object,
		required: true,
		trim: true
	},
	is_reward: {
		type: Boolean,
		required: true
	},
	is_active: {
		type: Boolean,
		required: true
	},
	is_drafted: {
		type: Boolean,
		required: true
	},
	activationDate: {
		type: Date,
		required: false,
		trim: true
	}
});

CouponsSchema.methods.toJSON = function () {
	let Coupons = this;
	let CouponsObject = Coupons.toObject();
	let couponJson = _.pick(CouponsObject, ['_id', 'idMerchant', 'title', 'title_ar', 'description', 'description_ar,',
		'idCampaignType', 'idCity', 'oldPrice', 'newPrice', 'numOfValidDays', 'numAvailable', 'maxOwner', 'discount', 'idCampaign',
		'dashboardData', 'createdAt', 'startDate', 'expirationDate', 'latestUpdate', 'is_reward', 'imageUrl', 'activationDate']);
	couponJson.status = statusToBeReturned(CouponsObject)
	couponJson.scheduled = setScheduled(CouponsObject)
	return couponJson
}

const statusToBeReturned = (coupon) => {
	let status
	if (coupon.is_active && !coupon.is_drafted) status = 'active'
	else if (coupon.is_drafted && !coupon.is_active) status = 'drafted'
	else if (!coupon.is_active && !coupon.is_drafted) status = 'history'
	return status
}

const setScheduled = (coupon) => {
	let scheduled
	let now = new Date()
	if (new Date(coupon.startDate) > now) {
		scheduled = true
	} else {
		scheduled = false
	}
	return scheduled
}

let Coupons = mongoose.model('Coupons', CouponsSchema);

module.exports = { Coupons }