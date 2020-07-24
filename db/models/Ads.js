const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let AdsSchema = new mongoose.Schema({
	idMerchant: {
		type: String,
		required: true,
		minlenght: 2,
		trim: true
	},
	segments: {
		type: Array,
		required: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	content: {
		type: String,
		required: true,
		trim: true,
		minlenght: 2
	},
	byMail: {
		type: Boolean,
		required: true
	},
	bySms: {
		type: Boolean,
		required: true
	},
	createdAt: {
		type: Date,
		required: true,
		trim: true
	}
});

AdsSchema.methods.toJSON = function(){
	let Ads = this;
	let AdsObject = Ads.toObject();
	return _.pick(AdsObject, ['_id','idMerchant','segments','title','content','byMail','bySms','createdAt']);
}


let Ads = mongoose.model('Ads', AdsSchema);

module.exports = {Ads}