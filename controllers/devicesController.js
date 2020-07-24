const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const devicesServices = require('../services/mainBackendServices/devicesServices');
const { generalResponse } = require('../requests/helpers/responseBody');

const app = express();
app.use(bodyParser.json());


const { Device } = require('../db/models/devices');

exports.addDevice = async (req, res) => {
  try {
    let body = _.pick(req.body, ['idBranch', 'dashboardData', 'posIdBranch']);
    let merchantData = req.merchant;
    // Data saved to our DB
    let deviceData = {
      idMerchant: merchantData.idMerchant,
      idBranch: body.idBranch,
      dashboardData: JSON.stringify(body.dashboardData),
      posIdBranch: body.posIdBranch
    };
    // Data sent to Bonat API
    let data = {
      idBranch: body.idBranch,
      dashboardData: JSON.stringify(body.dashboardData),
      posIdBranch: body.posIdBranch
    };
    const response = await devicesServices.createDevice(req, data);
    deviceData.idDevice = response.data.idDevice;
    let newDevice = new Device(deviceData);
    newDevice.save()
      .then(() => {
        return res.send({ ...newDevice._doc });
      })
      .catch(err => {
        res.send(err);
      });
  } catch (err) {
    res.status(400).send(err)
  }
};

// exports.activateDevice = (req, res) => {
//   let data = {
//     idDevice: req.params.device
//   };
//   devicesServices.activateDevice(req, data)
//     .then((response) => {
//       res.send(response.data);
//     })
//     .catch((err) => {
//       res.status(400).send(err);
//     });
// };

// exports.getList = (req, res) => {
//   let merchantData = req.merchant;
//   Device.find({ idMerchant: merchantData.idMerchant })
//     .then(result => {
//       res.send(generalResponse({ "List": result }, [], "Devices List"));
//     })
//     .catch(err => {
//       res.status(400).send(generalResponse({}, [err.errors], "Devices List"));
//     });
// };

// exports.getBranchDevices = (req, res) => {
//   let merchantData = req.merchant;
//   Device.find({ idMerchant: merchantData.idMerchant, idBranch: req.params.branch })
//     .then(result => {
//       res.send(generalResponse({ "List": result }, [], "Devices List"));
//     })
//     .catch(err => {
//       res.status(400).send(generalResponse({}, [err.errors], "Devices List"));
//     });
// };

exports.getList = (req, res) => {
  devicesServices.getList(req)
    .then((response) => {
      const responseData = response.data;
      const list = responseData.map(({idDevice, idMerchant, activationStatus, posIdBranch, idBranch, activationCode, device_createdAt}) => ({idDevice, idMerchant, activationStatus, posIdBranch, idBranch, activationCode, device_createdAt}));
      res.send(generalResponse({ 'List': list }, [], "Device List"))
    })
    .catch((err) => {
      res.send(generalResponse({ 'List': [] }, [], "Getting device list failed and returned empty array"))
    })
};

exports.getBranchDevices = (req, res) => {
  devicesServices.getList(req)
    .then((response) => {
      const responseData = response.data;
      const devicesData = responseData.filter((device) => {
        return device.idBranch == req.params.branch
      });
      const list = devicesData.map(({idDevice, idMerchant, activationStatus, posIdBranch, idBranch, activationCode, device_createdAt}) => ({idDevice, idMerchant, activationStatus, posIdBranch, idBranch, activationCode, device_createdAt}));
      res.send(generalResponse({ 'List': list }, [], "Device List"))
    })
    .catch((err) => {
      res.send(generalResponse({ 'List': [] }, [], "Getting device list failed and returned empty array"))
    })
}
