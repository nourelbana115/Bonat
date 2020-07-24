// const _ = require('lodash');
// const bodyParser = require('body-parser');
// const axios = require('axios');
// const express = require('express');
// const router = express.Router();
// const notificationController = require('../controllers/notificationController');
// let { Merchant } = require('./../db/models/merchant');

// let app = express();
// app.use(bodyParser.json());

// let { Notification } = require('../db/models/Notification');

// let { authenticate } = require('../middleware/authenticate');

// const getNotficationToken = (req, res, next) => {
//   let notificationToken = 'VeryLongRandomToken'; //supposed to be longer and more random
//   if (!req.body.token || req.body.token != notificationToken) {
//     res.status(400).send('Wrong token')
//   } 
// }

// router.post('/fetch', notificationController.fetchNotifications)

// router.get('/list', authenticate, notificationController.getList);

// module.exports = router