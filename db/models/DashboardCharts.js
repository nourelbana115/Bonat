const mongoose = require('mongoose');
const _ = require('lodash');

const DashboardChartSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

DashboardChartSchema.methods.toJSON = function () {
  let DashboardChart = this;
  let dashboardChartObject = DashboardChart.toObject();
  return _.pick(dashboardChartObject,
    ['_id',
      'merchant',
      'type',
      'chartData',
      'createdAt',
      'updatedAt',
    ]);
}


let DashboardChart = mongoose.model('DashboardChart', DashboardChartSchema);

module.exports = { DashboardChart }