const { validator } = require('../../middleware/validateRequest');
const { check } = require('express-validator');

const loyaltyProgramsValidation = 
[
  check('title').not().isEmpty().isLength({ min: 2 })
  .withMessage("Please fill title field with valid title, min 2 chars"),

  check('title_ar').not().isEmpty().isLength({ min: 2 })
  .withMessage("Please fill title_ar field with valid title, min 2 chars"),

  check('description').not().isEmpty().isLength({ min: 2 })
  .withMessage("Please fill description field with valid title, min 2 chars"),

  check('description_ar').not().isEmpty().isLength({ min: 2 })
  .withMessage("Please fill description_ar field with valid title, min 2 chars"),

  check('numOfValidDays').not().isEmpty().isNumeric()
  .withMessage("Please fill numOfValidDays field with a number"),

  check('idCampaignType').not().isEmpty().isNumeric()
  .withMessage("Please fill idCampaignType field with a number"),

  check('status').not().isEmpty().isIn(['drafted', 'active'])
  .withMessage("Please fill status field with a valid value ."),

  check('baseVisit').not().isEmpty().isNumeric()
  .withMessage("Please fill baseVisits field with a number"),

  check('min').not().isEmpty().isNumeric()
  .withMessage("Please fill min value field with a number"),

  check('avg').not().isEmpty().isNumeric()
  .withMessage("Please fill avg value field with a number"),

  check('max').not().isEmpty().isNumeric()
  .withMessage("Please fill max value field with a number"),

  validator
]

module.exports = { loyaltyProgramsValidation };