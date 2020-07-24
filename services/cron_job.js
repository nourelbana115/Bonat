require('../config/config');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
var router = express.Router();
const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
const upload = require('../services/multer');
const singleUpload = upload.single('image');
const cron = require("node-cron");

let app = express();
app.use(bodyParser.json());

const mongo = require('mongodb').MongoClient
const dbUrl = 'mongodb://localhost:27017'

let { mongoose } = require('../db/mongoose');
let { Merchant } = require('../db/models/merchant');
let { Receipts } = require('../db/models/Receipts');
let { DailyAverageSales } = require('../db/models/DailyAverageSales');
let { Coupons } = require('../db/models/Coupons');
let { Gift } = require('../db/models/gifts');
let { GiftStatistics } = require('../db/models/giftStatistics');
let { statistics } = require('../db/models/statistics')
let { Ads } = require('../db/models/Ads');
let { authenticate } = require('../middleware/authenticate');


cron.schedule("59 23 * * *", function () {
    console.log('Running Cron job')
    sendGiftOnDate()
})

function sendGiftOnDate() {
    Gift.find({}).then((result) => {
        let today = new Date
        for (i in result) {
            if (result[i].is_active == true) {
                // check segment type 

                if ((result[i].sendDate).getMonth() == today.getMonth() && result[i].sendDate.getDay() == today.getDay() && result[i].sendDate.getFullYear() == today.getFullYear()) {
                    let data = {
                        idMerchant: result[i].idMerchant,
                        idCampaign: result[i].idCampaign,
                        cusotmers: result[i].giftCustomers
                    }
                    sendGift(data).then((response)=>{
                        console.log('SUCCESS', response.data.message)
                    }).catch((err)=>{
                        console.log('[CRON-ERR] err', err)
                    })
                }
            }
        }

    }).catch((error) => {
        console.log('CRON-ERR', error)
    })
}

// send gift to customers data = {idCampaign: 1003, customers: [10, 11, 12]}
function sendGift(data) {
    return new Promise((resolve, reject) => {
        let url = "http://52.15.230.101:3000/bonat/v1/sendCoupon"
        let config = {
            headers: {
                "Authorization": "Bearer " + process.env.FIXED_MAIN_BACKEND_TOKEN
            }
        }
        console.log("data", JSON.stringify(data))
        axios.post(url, data, config)
            .then((response) => {
                if (response.code == 1){
                    return reject(response)
                }
                return resolve(response.data)
            })
            .catch((err) => {
                //logger.failedLogs('externalAPIErrors/errors.log', err, 'Send Gift')
                console.log('ERR', err)
                return reject(err)
            });
    })

}

