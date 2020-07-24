
const { validator } = require('../../middleware/validateRequest');
const { check } = require('express-validator');
const segmentsSerivces = require('../../services/mainBackendServices/segmentsServices');


const addEmailCampaignValidation = 
[
    check('campaignTitle').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill campaignTitle field with valid campaignTitle, min 3 chars"),

    check('campaignEmailContent').not().isEmpty().isLength({ min: 10 })
    .withMessage("Please fill campaignEmailContent field with valid campaignEmailContent, min 10 chars"),

    check('campaignFor')
    .if((value, { req }) =>  value != null)
    .not().isEmpty()
    .withMessage("Please fill campaignFor field with valid campaignFor, lenght 28 chars"),

    check('campaignForModel')
    .if((value, { req }) => value != null)
    .not().isEmpty().isIn(['Gift', 'Coupons'])
    .withMessage('Please fill campaignForModel field with valid campaignForModel Gift or Coupons'),
       
    check('isCustomSegment').not().isEmpty().isBoolean()
    .withMessage("Please fill isCustomSegment field with true or false."),

    check('dashboardData')
    .if((value, { req }) => req.body.dashboardData)
    .not().isEmpty().isJSON()
    .withMessage("Please fill dashboardData field with json object."),

    check('segmentType')
    .if((value, { req }) => !req.body.isCustomSegment)
    .not().isEmpty().isIn(segmentsSerivces.getDefaultSegmentTypes())
    .withMessage("Please fill segmentId field with valid segmentType"),
    
    check('emails')
    .if((value, { req }) => req.body.isCustomSegment)
    .isArray()
    .withMessage("Please fill emails with valid emails array"),
     
    check('sms')
    .if((value, { req }) => req.body.sms)
    .not().isEmpty().isLength({ min: 10, max:70 })
    .withMessage("Please fill sms field with valid sms message."),


    validator
];

const resendEmailCampaignValidation = 
[
    check('campaignId').not().isEmpty()
    .withMessage("please fill campaignId field with correct campaignId"),

    validator
];


module.exports = { addEmailCampaignValidation,resendEmailCampaignValidation };


