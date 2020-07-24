const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const adsController = require('../controllers/adsController');
const {addEmailCampaignValidation,resendEmailCampaignValidation, sendMessageValidation} = require('../requests/validations/adsValidation');

// router.post('/sendemails',
// [authenticate,...sendEmailsValidation]
// ,adsController.sendEmailSES);

router.post('/add-mail-campaign',
[authenticate,...addEmailCampaignValidation]
,adsController.addEmailCampaign);

router.get('/list-mail-campaigns',
authenticate
,adsController.ListMailsCampaign);

router.get('/list-paginated-mail-campaigns',
authenticate
,adsController.listPaginatedMailCampaigns);

router.post('/resend-mail-campaign',
[authenticate,...resendEmailCampaignValidation]
,adsController.resendMailCampaign);

module.exports = router;