const mongoose = require('mongoose');
const _ = require('lodash');

const DashboardBranchInsightSchema = new mongoose.Schema({
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
  idBranch: {
    type: Number,
    required: true
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

DashboardBranchInsightSchema.methods.toJSON = function () {
  let DashboardBranchInsight = this;
  let dashboardBranchInsightObject = DashboardBranchInsight.toObject();
  return _.pick(dashboardBranchInsightObject,
    ['_id',
      'merchant',
      'type',
      'label',
      'value',
      'priority',
      'idBranch',
      'createdAt',
      'updatedAt',
    ]);
}

let DashboardBranchInsight = mongoose.model('DashboardBranchInsight', DashboardBranchInsightSchema);

module.exports = { DashboardBranchInsight }