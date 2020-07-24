const mongoose = require('mongoose');
const _ = require('lodash');

const DashboardBranchChartSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Merchant'
  },
  type: {
    type: String,
    required: true
  },
  chartData: {
    type: Object,
    required: true
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
});

DashboardBranchChartSchema.methods.toJSON = function () {
  let DashboardBranchChart = this;
  let dashboardBranchChartObject = DashboardBranchChart.toObject();
  return _.pick(dashboardBranchChartObject,
    ['_id',
      'merchant',
      'type',
      'chartData',
      'idBranch',
      'createdAt',
      'updatedAt',
    ]);
}


let DashboardBranchChart = mongoose.model('DashboardBranchChart', DashboardBranchChartSchema);

module.exports = { DashboardBranchChart }