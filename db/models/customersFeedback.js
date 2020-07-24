const mongoose = require('mongoose');
const _ = require('lodash');
const mongoosePaginate = require('mongoose-paginate-v2');

const CustomersFeedbackSchema = new mongoose.Schema({
	merchant:{
		type: mongoose.Schema.Types.ObjectId,
		required:true,
		ref: 'Merchent'
	},
	customer:{
		type: mongoose.Schema.Types.ObjectId,
		required:false,
		ref: 'Customers'
	},
	idCustomer:{
		type: String,
		required: true,
		trim:true,
    },
    idMerchant:{
		type: String,
		required: true,
		trim:true,
    },
    name:{
		type: String,
	},
	message:{
       type:String,
	},
	inboxId: {
		type: String,
		required: true,
		unique:true
    },
    email: {
		type: String,
	},
	createdAt: {
		type: Date,
		required: true,	
    },
    isnew: {
		type: Number,
		required: true,
	},
	mood:{
		type:String,
	 },
	 rate: {
		type: Number,
		required: true,
	},
	scale: {
		type: Number,
		required: true,
	}

});

CustomersFeedbackSchema.methods.toJSON = function () {
	let feedback = this;
	let feedbackObject = feedback.toObject();
	return _.pick(feedbackObject, ['_id','merchant','customer',
	'idCustomer','idMerchant','name','message','inboxId','email','isnew','rate','scale','createdAt']);
}


CustomersFeedbackSchema.plugin(mongoosePaginate);

const CustomersFeedback = mongoose.model('CustomersFeedback', CustomersFeedbackSchema);

module.exports = CustomersFeedback;