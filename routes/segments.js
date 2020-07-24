const express = require('express');

const router = express.Router();

const segmentsController =  require('../controllers/segmentsController');

const { authenticate } = require('../middleware/authenticate');


router.get('/list', authenticate,segmentsController.listSegments);

router.get('/list-count', authenticate,segmentsController.listSegmentsCount);

router.get('/stats', authenticate,segmentsController.listSegmentsStats);

module.exports = router;