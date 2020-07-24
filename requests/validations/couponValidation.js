const { validator } = require('../../middleware/validateRequest');
const { check } = require('express-validator');
let currentDate = `${new Date()}`

const couponValidation = 
[
    check('title').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title field with valid title, min 3 chars"),

    check('title_ar').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title_ar field with valid title, min 3 chars"),

    check('description').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('description_ar').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('oldPrice').not().isEmpty().isNumeric()
    .withMessage("Please fill oldPrice field with a number."),

    check('newPrice').not().isEmpty().isNumeric()
    .withMessage("Please fill newPrice field with a number."),

    check('startDate').not().isEmpty().not().isBefore(currentDate)
    .withMessage("Please fill expirationDate field with a VALID date ."),

    check('expirationDate').not().isEmpty().not().isBefore(currentDate)
    .custom((value,{req})=>{
        if(new Date(req.body.startDate) <= new Date(value)) return true
        else return false
    })
    .withMessage("Please fill expirationDate field with a VALID date ."),

    check('numAvailable').not().isEmpty().isNumeric()
    .withMessage("Please fill numAvailable field with a number."),

    check('status').not().isEmpty().isIn(['drafted', 'active'])
    .withMessage("Please fill status field with a valid value ."),
    
    check('imageUrl').not().isEmpty().isArray()
    .withMessage("Please fill imageUrl field with a valid array of images ."),

    check('idCity').not().isEmpty().isNumeric()
    .withMessage("Please fill idCity field with a number."),

    check('idCampaignType').not().isEmpty().isNumeric()
    .withMessage("Please fill idCampaignType field with a number."),

    check('maxOwner').not().isEmpty().isNumeric()
    .withMessage("Please fill maxOwner field with a number."),

    check('numOfValidDays').not().isEmpty().isNumeric()
    .withMessage("Please fill numOfValidDays field with a number."),
     
    check('dashboardData').not().isEmpty()
    .withMessage("Please fill dashboardData field with a valid value."),
      
    check('is_reward').not().isEmpty().isBoolean()
    .withMessage("Please fill is_reward  field with a boolean ."),
    
    check('discount').not().isEmpty().isNumeric()
    .withMessage("Please fill discount field with a number."),

     
    validator
];
// const couponEditValidation = 
// [
//     check('title').not().isEmpty().isLength({ min: 3 })
//     .withMessage("Please fill title field with valid title, min 3 chars"),

//     check('title_ar').not().isEmpty().isLength({ min: 3 })
//     .withMessage("Please fill title_ar field with valid title, min 3 chars"),

//     check('description').not().isEmpty().isString()
//     .withMessage("Please fill description with a valid value "),

//     check('description_ar').not().isEmpty().isString()
//     .withMessage("Please fill description with a valid value "),

//     check('oldPrice').not().isEmpty().isNumeric()
//     .withMessage("Please fill oldPrice field with a number."),

//     check('newPrice').not().isEmpty().isNumeric()
//     .withMessage("Please fill newPrice field with a number."),

//     check('expirationDate').not().isEmpty()
//     .withMessage("Please fill expirationDate field with a VALID date ."),

//     check('numAvailable').not().isEmpty().isNumeric()
//     .withMessage("Please fill numAvailable field with a number."),

//     check('is_active').not().isEmpty().isBoolean()
//     .withMessage("Please fill is_active field with a boolean ."),
    
//     check('is_drafted').not().isEmpty().isBoolean()
//     .withMessage("Please fill is_drafted  field with a boolean ."),
    
//     check('imageUrl').not().isEmpty().isArray()
//     .withMessage("Please fill imageUrl field with a valid array of images ."),

//     check('idCity').not().isEmpty().isNumeric()
//     .withMessage("Please fill idCity field with a number."),

//     check('idCampaignType').not().isEmpty().isNumeric()
//     .withMessage("Please fill idCampaignType field with a number."),

//     check('maxOwner').not().isEmpty().isNumeric()
//     .withMessage("Please fill maxOwner field with a number."),

//     check('numOfValidDays').not().isEmpty().isNumeric()
//     .withMessage("Please fill numOfValidDays field with a number."),
     
//     check('dashboardData').not().isEmpty()
//     .withMessage("Please fill dashboardData field with a valid value."),
      
//     check('is_reward').not().isEmpty().isBoolean()
//     .withMessage("Please fill is_reward  field with a boolean ."),
    
//     check('discount').not().isEmpty().isNumeric()
//     .withMessage("Please fill numOfValidDays field with a number."),
     
 
//     validator
// ];

module.exports = { couponValidation };