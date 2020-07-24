const { validator } = require('../../middleware/validateRequest');
const { check } = require('express-validator');

const markInboxReadValidation = 
[
    check('inboxId').not().isEmpty().isLength({ min: 36, max: 36 })
    .withMessage("Please fill inboxId field with valid inboxId, 36 chars"),

    validator
];

module.exports = { markInboxReadValidation };