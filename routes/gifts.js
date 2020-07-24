require('../config/config');
// const fs = require('fs');
// const _ = require('lodash');
const bodyParser = require('body-parser');
// const axios = require('axios');
const express = require('express');
var router = express.Router();
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
// const upload = require('../services/multer');
// const singleUpload = upload.single('image');

let app = express();
app.use(bodyParser.json());

let { authenticate } = require('../middleware/authenticate');
// let segmentModule = require('./segments')
const giftsController =  require('../controllers/giftsController')
const {giftsUnpublishAndPublishValidator,giftsAddValidator,giftsCustomAddValidator}= require('../requests/validations/giftsValidation')


//adding a gift 
router.post('/add',[ authenticate,giftsAddValidator], giftsController.addGift );

// get active gifts
router.get('/list-active', authenticate,giftsController.getActiveGifts)

//get all gifts
router.get('/list', authenticate,giftsController.getAllGifts);

// set drafted gift as active
router.post('/publish',[authenticate,giftsUnpublishAndPublishValidator],giftsController.publishGifts)

// unpublish or stop gift
router.post('/unpublish',[ authenticate ,giftsUnpublishAndPublishValidator], giftsController.unpublishGifts)

// get all gifts statistics
 router.get('/statistics', authenticate,giftsController.getAllGiftsStatistics);

// get one gift statistics

router.get('/statistics/:id', authenticate,giftsController.giftStatistics);

// send gift for specified
router.post('/create-custom-gift',[ authenticate,giftsCustomAddValidator],giftsController.customGifts);

//get all gifts titles 
router.get('/list-titles', authenticate,giftsController.getTitles);

module.exports = router;
