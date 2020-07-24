const mongoose = require('mongoose');
const _ = require('lodash');

const DashboardInsightSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Merchant'
  },
  type: {
    type: String,
    required: true
    // enum: ['averageReturn']
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

DashboardInsightSchema.methods.toJSON = function () {
  let DashboardInsight = this;
  let dashboardInsightObject = DashboardInsight.toObject();
  return _.pick(dashboardInsightObject,
    ['_id',
      'merchant',
      'type',
      'label',
      'value',
      'priority',
      'createdAt',
      'updatedAt',
    ]);
}

let DashboardInsight = mongoose.model('DashboardInsight', DashboardInsightSchema);

module.exports = { DashboardInsight }