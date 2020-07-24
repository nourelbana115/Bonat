const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

let GiftSchema = new mongoose.Schema({
    merchant: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
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
    imageUrl: {
        type: Array,
        required: false
    },
    receivedCustomers:[
        {
            type: mongoose.Schema.Types.ObjectId,
            // required:true,
            ref: 'Customers'
        }
    ],
    dashboardData: {
        type: Object,
        required: true,
        trim: true
    },
    segment:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segments'
    },
    sendDate:{ 
        type: Date,
		//required: true,
		trim: true
    },
    expirationDate:{ 
        type: Date,
		//required: true,
		trim: true
    },
    status:{
        type: String,
        required: true,
        enum: ['created','active','draft','history'],
        default:'created'
    },
    numOfValidDays: {
        type: Number,
        required: true,
        trim: true
    },
    idCampaignType: {
        type: Number,
        required: false,
        trim: true,
        enum: [5,6],
        default:5
    },
    discount: {
        type: Number,
        required: false,
        trim: true
    },
    createdAt:{
        type: Date,
        required: true,
        default:Date.now
    },
    updatedAt:{
        type: Date,
        required: true,
        default:Date.now
    },
    giftSegmentId :{
        type: String,
        // required: true,
        trim: true,
    }


});

GiftSchema.methods.toJSON = function () {
    let Gift = this;
    let GiftObject = Gift.toObject();
    let giftJson = _.pick(GiftObject, 
    ['_id', 
    'merchant',
    'title',
    'description',
    'imageUrl',
    'dashboardData',
    'status',
    'segment', 
    'sendDate',
    'idCampaign',
    'numOfValidDays',
    'idCampaignType',
    'createdAt',
    'updatedAt',
    'expirationDate'
    ]);
    giftJson.status_label = statusLabel(GiftObject)
    return giftJson
}

const statusLabel = (gift) =>{
	let status_label
	if(gift.status == 'active' && gift.expirationDate) status_label ='scheduled'
	else status_label = null
	return status_label
}
let Gift = mongoose.model('Gift', GiftSchema);

module.exports = { Gift }