const request = require('request');
const logger = require('./logger');
const {stringToJson} = require('../utilities/json')

const sendSMS = ({ message, number, senderId }) => {
  return new Promise((resolve, reject) => {
    //resolve({"success":"true","message":"","errorCode":"ER-00","data":{"MessageID":3287241804,"Status":"Queued","NumberOfUnits":1,"Cost":"0.10000","Balance":"0.29878","Recipient":"201558686771","TimeCreated":"2019-11-27 01:05:21","CurrencyCode":"USD"}})
    request({
      method: 'POST',
      url: `${process.env.UNIFONIC_API_URL}send`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `AppSid=${process.env.UNIFONIC_APPSID}&Recipient=${number}&Body=${message}`
    }, function (error, response, body) {
      
      if (error == null) {
        return resolve(stringToJson(body))
      }else{
        logger.log('general','error',error,"SMS Service");
        return reject(error)
      }
     
    });
  });
};

module.exports = {sendSMS} 