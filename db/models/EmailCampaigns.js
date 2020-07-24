const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const mongoosePaginate = require('mongoose-paginate-v2');

const Emails = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  }
, email: String
});

const EmailMessages = new mongoose.Schema({
    emails:[
      {
        type:String
      }
    ]
});

const ExectutionPlans = new mongoose.Schema({
  planStatus:{
    type: String,
    required: true,
    enum: ['newOne','done','failed'],
    default:'newOne'
  },
  messageStatus:[{
    messageId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EmailMessages'
    },
    requestId:String,
    sesMessageId:String,
    sendStatus:{
      type: String,
      enum: ['done','failed'],
    }
  }],
  createdAt:{
    type: Date,
		required: true,
		default:Date.now
  },
});

const emailCampaignsSchema = new mongoose.Schema({
    campaignTitle: {
		type: String,
		required: true,
		minlenght: 3,
		trim: true
    },
    campaignEmailContent: {
		type: String,
		required: true,
		minlenght: 10,
		trim: true
    },
    segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segments',
    require:true
    },
    mobileMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MobileMessage',
      require:false
    },
    isCustomSegment:{
      type: Boolean,
      required:true,
      default:false
    },
    merchant: {
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref: 'Merchant'
    },
    campaignFor: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      refPath: 'campaignForModel'
    },
    campaignForModel: {
      type: String,
      required: false,
      enum: ['Gift', 'Coupons']
    },

    exectutionPlans: [ExectutionPlans],

    emails:[{
      type: mongoose.Schema.Types.ObjectId,
      required:true,
      ref: 'Customers'
    }],

    emailMessages:[EmailMessages],

    /*campaignStatus:{
      type: String,
      required: true,
      enum: ['newOne', 'inProcess','done']
    },*/
    dashboardData: {
      type: Object,
      //required: true,
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
    }

});


emailCampaignsSchema.methods.toJSON = function() {
	const emailCampaigns = this;
	const emailCampaignsObject = emailCampaigns.toObject();
    return _.pick(emailCampaignsObject,
    [
    '_id',
    'campaignTitle',
    'campaignEmailContent',
    'segment',
    'merchant',
    'campaignFor',
    'campaignForModel',
    'exectutionPlan',
    'emails',
    'isCustomSegment',
    /*'campaignStatus',*/
    'dashboardData',
    'mobileMessage',
    'createdAt',
    'updatedAt'
    ]);
}

emailCampaignsSchema.plugin(mongoosePaginate);

const EmailCampaigns = mongoose.model('EmailCampaigns', emailCampaignsSchema);

module.exports = { EmailCampaigns };


