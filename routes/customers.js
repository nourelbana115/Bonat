const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const customersController = require('../controllers/customersController');
const {markInboxReadValidation} = require('../requests/validations/customerValidation');

router.get('/info', authenticate,customersController.customerInfo);

router.get('/visits', authenticate,customersController.custsVisits);

router.get('/stats', authenticate, customersController.customersStats);

router.get('/customersFeedBack/',authenticate,customersController.customersFeedBack);

router.get('/paginated-customersFeedBack/:page',authenticate,customersController.paginatedCustomersFeedBack);

router.get('/segmentCustomers/:segmentType/:page',authenticate,customersController.getPaginatedSegmentCustomers);

router.post('/feedBackMarkAsRead',
[authenticate,...markInboxReadValidation],
customersController.feedBackMarkAsRead);

module.exports = router;