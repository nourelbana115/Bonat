const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const devicesController = require('../controllers/devicesController');

let app = express();
app.use(bodyParser.json());

let { authenticate } = require('../middleware/authenticate');

router.post('/create', authenticate, devicesController.addDevice);

// router.post('/activate/:device', authenticate, devicesController.activateDevice);

router.get('/list', authenticate, devicesController.getList);

router.get('/list/:branch', authenticate, devicesController.getBranchDevices);

module.exports = router;
