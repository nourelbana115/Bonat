
const _ = require('lodash');
const axios = require('axios');
const express = require('express');
const router = express.Router();
const logger = require('../services/logger');
let { Merchant } = require('../db/models/merchant');
const { runSeeder } = require('../db/seeds/seederRunner');
const { saveHistoricalData } = require('../services/saveHistoricalData')

const queue = require('../services/QueuingServices/queue');
queue.worker.listen();

//--- start /merchant/info api
router.post('/info', (req, res) => {
  let body = _.pick(req.body, ['token', 'idMerchant', 'email', 'baseVisit', 'link', 'merchantImageUrl', 'name', 'phoneNumber']);
  if (!body.token) {
    res.status(400).send({ message: "token not found" });
  } else {
    Merchant.findOne({
      idMerchant: body.idMerchant
    }).then((result) => {
      if (result) {
        //saving backend token 
        if (!result.token || (result.token != body.token)) {
          result.token = body.token;
          result.save()
            .then(ok => console.log(ok))
            .catch((error) => logger.log('general', 'error', error, 'saving token'));
        }
        setDefaultSegmentsForMerchant(result._id);
        //return merchant info
        let token = result.generateAuthToken();
        return res.header('x-auth', token).send({ ...result._doc, "ourToken": token });
      } else {
        //add new merchant and returm merchant info
        let newMerchantData = new Merchant(body);
        newMerchantData.save().then((newMerchant) => {
          setDefaultSegmentsForMerchant(newMerchant._id);
          let token = newMerchant.generateAuthToken();
          saveHistoricalData(newMerchant)
          queue.publisher.dispatch(
            {
              jobfile: "updateMerchantDataJob",
              data: {}
            });
          return res.header('x-auth', token).send({ ...newMerchant._doc, "ourToken": token });
        }).catch((e) => {
          res.status(400).send(e);
        });
      }
    }, (err) => {
      res.status(400).send(err);
    })
  }
});
//--- end /merchant/info api

// start set new  password
router.post('/set-password', (req, res) => {
  let body = _.pick(req.body, ['email', 'oldPassword', 'confirmPassword', 'password']);
  setNewPassword(req, body).then((response) => {
    if (response.status == 200) {
      return res.send(response.data);
    }
  }).catch((err) => {
    res.status(400).send(err);
  });
})

// set new password
function setNewPassword(req, data) {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}resetPassword`
    axios.post(url, data)
      .then((response) => {
        //logger.log('requests', 'info', response.data, 'Set New Password')
        return resolve(response)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Set New Password')
        return reject(err)
      });
  })
}


// end set new password

const setDefaultSegmentsForMerchant = (merchantId) => {
  runSeeder({
    seederfile: 'segmentsSeeder',
    data: {
      merchantId: merchantId
    }
  });
}

module.exports = router