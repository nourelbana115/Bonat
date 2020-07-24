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

let app = express();
app.use(bodyParser.json());

const mongo = require('mongodb').MongoClient
const dbUrl = 'mongodb://localhost:27017'

let { mongoose } = require('../db/mongoose');
let { Merchant } = require('../db/models/merchant');
let { Receipts } = require('../db/models/Receipts');
let { DailyAverageSales } = require('../db/models/DailyAverageSales');
let { Segments } = require('../db/models/Segments');
let { Coupons } = require('../db/models/Coupons');
let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
let { Gift } = require('../db/models/gifts');
let { CouponStatistics } = require('../db/models/couponStatistics');
let { statistics } = require('../db/models/statistics')
let { Ads } = require('../db/models/Ads');
let { authenticate } = require('../middleware/authenticate');
const {loyaltyProgramsValidation} = require('../requests/validations/loyaltyProgramsValidation');

var loyaltyProgramsController = require('../controllers/loyaltyProgramsController');

//--- start loyalty program
// add program
router.post('/add', [authenticate, ...loyaltyProgramsValidation], loyaltyProgramsController.addLoyaltyProgram);

router.post('/createnewloyalty', authenticate, loyaltyProgramsController.addNewLoyaltyProgram);

router.post('/activateloyalty/:loyaltyId', authenticate, loyaltyProgramsController.activateLoyalty);
//edit program
// router.post('/edit', [authenticate, ...loyaltyProgramsValidation], loyaltyProgramsController.editLoyaltyProgram);

// set loyalty
router.post('/set-loyalty', authenticate, loyaltyProgramsController.publishLoyaltyProgram)

//delete program
router.post('/delete', authenticate, loyaltyProgramsController.deleteLoyaltyProgram);

//get program list
router.get('/list', authenticate, loyaltyProgramsController.getList);

// get statistics
router.get('/statistics/', authenticate, loyaltyProgramsController.getStatistics);

//--- end loyalty program

module.exports = router