const bodyParser = require('body-parser');
const express = require('express');
const notficationServices = require('../services/mainBackendServices/notificationServices');

let app = express();
app.use(bodyParser.json());

let { Notification } = require('../db/models/Notification');

exports.fetchNotifications = (req, res) => {
  // const merchantid = req.params.merchantid
  notficationServices.getNotifications(req)
    .then(response => {
      for (i in response) {
        // console.log(response[i].idMerchant);
        let notificationData = {
          idMerchant: response[i].idMerchant,
          message: response[i].text,
          type: response[i].type,
          read: response[i].read,
          date: new Date()
        };
        let newNotification = new Notification(notificationData);
        newNotification.save().then(response => {
          return res.send({ ...response._doc });
        }).catch((err) => {
          res.status(400).send(err);
        });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
};

exports.getList = (req, res) => {
  let merchantData = req.merchant;
  console.log(merchantData)
  Notification.find({ idMerchant: merchantData.idMerchant })
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.status(400).send(err);
    })
};
