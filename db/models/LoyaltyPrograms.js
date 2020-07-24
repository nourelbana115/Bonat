const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let LoyaltyProgramsSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlength: 2,
		trim: true
	},
	merchant: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'Merchant'
	},
	idCampaign: {
		type: String,
		required: false,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 2
	},
	title_ar: {
		type: String,
		required: true,
		trim: true,
		minlength: 2
	},
	description: {
		type: String,
		required: true,
		trim: true,
		minlength: 2
	},
	description_ar: {
		type: String,
		required: true,
		trim: true,
		minlength: 2
	},
	numOfValidDays: {
		type: Number,
		required: true,
		trim: true
	},
	idCampaignType: {
		type: Number,
		required: true,
		trim: true
	},
	coverImageUrl: {
		type: String,
		required: false,
	},
	posIdProduct: {
		type: Number,
		required: false,
		trim: true
	},
	imageUrl: {
		type: Array,
		required: false
	},
	dashboardData: {
		type: Object,
		required: true,
		trim: true
	},
	createdAt: {
		type: Date,
		required: true,
		trim: true,
		default: Date.now
	},
	latestUpdate: {
		type: Date,
		required: true,
		trim: true
	},
	activationDate: {
		type: Date,
		required: false,
		trim: true
	},
	minVisits: {
		type: Number,
		// changed to false to support new program
		required: false,
		trim: true
	},
	is_active: {
		type: Boolean,
		required: true
	},
	is_drafted: {
		type: Boolean,
		required: true
	},
	min: {
		type: Number,
		required: false,
		trim: true
	},
	avg: {
		type: Number,
		required: false,
		trim: true
	},
	max: {
		type: Number,
		required: false,
		trim: true
	},
	// added support new program
	pointValue: {
		type: Number,
		required: false,
		trim: true
	},

});

LoyaltyProgramsSchema.methods.toJSON = function () {
	let LoyaltyPrograms = this;
	let LoyaltyProgramsObject = LoyaltyPrograms.toObject();
	let LoyaltyProgramsJson = _.pick(LoyaltyProgramsObject, [
		'_id', 'idMerchant', 'idCampaign', 'title', 'title_ar',
		'description', 'description_ar', 'numOfValidDays', 'idCampaignType', 'posIdProduct',
		'coverImageUrl', 'imageUrl', 'dashboardData', 'merchant',
		'createdAt', 'latestUpdate', 'activationDate', 'pointValue', 'minVisits', 'reward', 'min', 'max', 'avg'
	]);
	LoyaltyProgramsJson.status = statusToBeReturned(LoyaltyProgramsObject)
	LoyaltyProgramsJson.pending = setPending(LoyaltyProgramsObject)
	return LoyaltyProgramsJson
}

const statusToBeReturned = (program) => {
	let status
	if (program.is_active && !program.is_drafted) status = 'active'
	else if (program.is_drafted && !program.is_active) status = 'drafted'
	else if (!program.is_active && !program.is_drafted) status = 'history'
	return status
}

const setPending = (program) => {
	let pending
	if (!program.idCampaign) pending = true
	else pending= false
	return pending
}

let LoyaltyPrograms = mongoose.model('LoyaltyPrograms', LoyaltyProgramsSchema);

module.exports = { LoyaltyPrograms }