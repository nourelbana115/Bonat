const mongoose = require('mongoose');
const _ = require('lodash');

const DashboardUserSchema = new mongoose.Schema({
  secret: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inacitve']
  },
  access_id: {
    type: String,
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

DashboardUserSchema.methods.toJSON = function () {
  let DashboardUser = this;
  let DashboardUsertObject = DashboardUser.toObject();
  return _.pick(DashboardUsertObject,
    ['_id',
      'secret',
      'status',
      'access_id',
      'createdAt',
      'updatedAt',
    ]);
}

let DashboardUser = mongoose.model('DashboardUser', DashboardUserSchema);

module.exports = { DashboardUser }