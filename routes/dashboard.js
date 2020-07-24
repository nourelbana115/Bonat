const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

let app = express();
app.use(bodyParser.json());

let { authenticate } = require('../middleware/authenticate');

// Get Branches
router.get('/branches', authenticate, dashboardController.returnBranchIds)

// Get Dashboard Insights
router.get('/', authenticate, dashboardController.getDashboardInsights)

// get visits per customer chart
router.get('/visitspercustomer', authenticate, dashboardController.visitsPerCustomerChart)

// get Dashboard Quick Actions / genenral tab 
router.get('/general',authenticate,dashboardController.getGeneral);

//get dashboard customer feedback statistics  
router.get('/feedback',authenticate,dashboardController.feedbackStats)

//get dashboard customer new vs retuning customer  
router.get('/dailyvisits',authenticate,dashboardController.newVsReturn)
// router.get('/dailyvisits/branch',authenticate,dashboardController.newVsReturnBranch)

// get coupons chart
router.get('/couponchart', authenticate, dashboardController.couponChart)

// get gifts chart
router.get('/giftchart', authenticate, dashboardController.giftChart)

module.exports = router;
