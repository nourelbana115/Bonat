require('../config/config');
// const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
// const axios = require('axios');
const express = require('express');
var router = express.Router();
// const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
// const upload = require('../services/multer');
// const singleUpload = upload.single('image');

let app = express();
app.use(bodyParser.json());
//note : anything that has been commented that's beacuse it wasn't used .

// const mongo = require('mongodb').MongoClient
// const dbUrl = 'mongodb://localhost:27017'

// let { mongoose } = require('../db/mongoose');
// let { Merchant } = require('../db/models/merchant');
// let { Receipts } = require('../db/models/Receipts');
// let { DailyAverageSales } = require('../db/models/DailyAverageSales');
// let { Segments } = require('../db/models/Segments');
// let { Coupons } = require('../db/models/Coupons');
// let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
// let { Gift } = require('../db/models/gifts');
// let { CouponStatistics } = require('../db/models/couponStatistics');
// let { statistics } = require('../db/models/statistics')
// let { Ads } = require('../db/models/Ads');
let { authenticate } = require('../middleware/authenticate');

const couponController = require('../controllers/couponsController');
const { couponValidation } = require('../requests/validations/couponValidation');

//--- start coupons/rewards

// add coupon
router.post('/add', [authenticate,couponValidation], couponController.addCoupon);

//edit coupon
router.post('/edit', [authenticate,couponValidation], couponController.editCoupon);

//delete coupon
router.post('/delete', authenticate, couponController.deleteCoupon);

//get coupons list
router.get('/list', authenticate, couponController.allCoupons);

//get coupons list titles
router.get('/list-titles', authenticate, couponController.allCouponsTitles);

// get coupons statistics

router.get('/statistics',authenticate, couponController.allCouponsStats)

//get specific coupon statistics
router.get('/statistics/:idCampaign',authenticate,couponController.oneCouponStatsFromDb)

// unpublish coupon
router.post('/:idCampaign/unpublish', authenticate, couponController.couponUnpublish)

// coupon chart
router.get('/chart/:idcampaign', authenticate, couponController.couponChart)


//--- end coupons/rewards


module.exports = router