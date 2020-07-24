const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let MerchantSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	name: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		minlenght: 1,
		unique: true,
		validate: {
			validator: (value) => {
				return validator.isEmail(value);
			},
			message: '{VALUE} is not a valid email!'
		}
	},
	merchantImageUrl: {
		type: String,
		required: true,
		trim: true
	},
	phoneNumber: {
		type: String,
		required: true,
		trim: true
	},
	token: {
		type: String,
		required: true,
		trim: true
	},
	balance:
	{
		type: Number,
		default: 0
	},
	pointsGiven: {
		type: Number,
		trim: true,
		default: 0
	},
	pointsRedeemed: {
		type: Number,
		trim: true,
		default: 0
	},
	pointsEarned: {
		type: Number,
		trim: true,
		default: 0
	},
	idLoyaltyType: {
		type: Number,
		trim: true,
		enum: [1, 2]
	},
	idSubscription: {
		type: Number,
		trim: true,
		enum: [1, 2]
	}
});

MerchantSchema.methods.toJSON = function () {
	let user = this;
	let userObject = user.toObject();
	return _.pick(userObject, ['_id', 'idMerchant', 'name', 'email', 'merchantImageUrl', 'phoneNumber', 'balance', 'pointsGiven', 'pointsRedeemed', 'pointsEarned', 'idLoyaltyType', 'idSubscription']);
}

MerchantSchema.methods.generateAuthToken = function () {
	let merchant = this;
	let access = 'merchantToken';
	let token = jwt.sign({ idMerchant: (merchant.idMerchant), access }, process.env.JWT_SECRET).toString();
	return token
}
MerchantSchema.statics.findByToken = function (token) {
	let Merchant = this;
	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		return Promise.reject();
	}
	if (decoded.access === 'merchantToken') {
		return Merchant.findOne({
			'idMerchant': decoded.idMerchant
		});
	} else {
		return Promise.reject();
	}
}

let Merchant = mongoose.model('Merchant', MerchantSchema);

module.exports = { Merchant }