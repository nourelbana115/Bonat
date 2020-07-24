const mongoose = require('mongoose');
const _ = require('lodash');

const MobileMessages = new mongoose.Schema({
  numbers: [
    {
      type: String
    }
  ]
});

const ExectutionPlans = new mongoose.Schema({
  planStatus: {
    type: String,
    required: true,
    enum: ['newOne', 'done', 'failed'],
    default: 'newOne'
  },
  messageStatus: [{
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MobileMessages'
    },
    smsMessageId: String,
    cost: String,
    balance:String,
    requestId: String,
    sendStatus: {
      type: String,
      enum: ['done', 'failed'],
    }
  }],
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
});

const MobileMessageSchema = new mongoose.Schema({
  messageContent: {
    type: String,
    required: true,
    minlenght: 10,
    maxlength: 70
  },
  numbers: {
    type: Array,
    required: true
  },
  segment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Segments',
    required: false
  },
  isCustomSegment: {
    type: Boolean,
    required: true,
    default: false
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Merchant'
  },
  mobileMessages: [MobileMessages],
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
  dashboardData: {
    type: Object,
    trim: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

MobileMessageSchema.methods.toJSON = function () {
  let MobileMessage = this;
  let MobileMessageObject = MobileMessage.toObject();
  return _.pick(MobileMessageObject, [
    '_id',
    'messageContent',
    'numbers', 
    'segment',
    'isCustomSegment',
    'merchant',
    'campaignFor',
    'campaignForModel',
    'exectutionPlans',
    'dashboardData',
    'createdAt',
    'updatedAt',
  ]);
};

const MobileMessage = mongoose.model('MobileMessage', MobileMessageSchema);

module.exports = { MobileMessage }