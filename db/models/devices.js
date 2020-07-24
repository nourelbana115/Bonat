const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');

const DeviceSchema = new mongoose.Schema({
  idBranch: {
    type: Number,
    required: true
  },
  idMerchant: {
    type: String,
    required: true,
    minlength: 2,
    trim: true
  },
  // name: {
  //   type: String,
  //   required: true,
  //   minlength: 2
  // },
  idDevice: {
    type: Number,
    required: true
  },
  posIdBranch: {
    type: String
  }
});

DeviceSchema.methods.toJSON = function () {
  let Device = this;
  let DeviceObject = Device.toObject();
  return _.pick(DeviceObject, ['_id', 'idMerchant', 'idBranch', 'idDevice', 'posIdBranch']);

  // return _.pick(DeviceObject, ['_id', 'idMerchant', 'name', 'idBranch', 'idDevice', 'activationCode', 'posIdBranch', 'activationStatus',
  // 'token', 'device_createdAt', 'deviceModel', 'appVersion', 'deviceOS', 'deviceOSVersion', 'lat', 'lng', 'workingHours',
  // 'idCity', 'district', 'district_ar', 'branch_createdAt', 'branch_createdAt', 'managerName', 'managerPhoneNumber', 
  // ]);
}

const Device = mongoose.model('Device', DeviceSchema);

module.exports = { Device }