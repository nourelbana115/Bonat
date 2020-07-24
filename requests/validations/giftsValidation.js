const { validator } = require('../../middleware/validateRequest');
const { check } = require('express-validator');


let names = ['superFan','lostCustomers','newCustomers','everyone','birthday']
let everyone = ['send_after_publishing','send_on_particular_date']
let birthday = ['send_this_month','send_till_campaign_stop','send_till_particular_date','superfan_birthday_gift']
let lostCustomers =['send_once','send_till_campaign_stop']
let newCustomers =['send_once','send_till_campaign_stop']
let superFan =['send_once']
let rangeDates =['send_till_particular_date','send_on_particular_date']
let sendNow = ['send_once','send_after_publishing','send_till_campaign_stop','send_this_month','superfan_birthday_gift']
let status = ['drafted','active']
let currentDate = `${new Date()}`
const giftsUnpublishAndPublishValidator =
[
    check('_id').not().isEmpty().isMongoId()
    .withMessage("Please fill _id with a valid mongo id "),

    validator
]

const giftsAddValidator =
[
    check('title').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title field with valid title, min 3 chars"),

    check('title_ar').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title_ar field with valid title, min 3 chars"),

    check('description').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('description_ar').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('numOfValidDays').not().isEmpty().isNumeric()
    .withMessage("Please fill numOfValidDays field with a number."),

    check('discount').not().isEmpty().isNumeric()
    .withMessage("Please fill discount field with a number."),

    check('imageUrl').not().isEmpty().isArray()
    .withMessage("Please fill imageUrl field with a valid array of images ."),

    check('status').not().isEmpty().isIn(status)
    .withMessage("Please fill status field with a valid value ."),

    check('dashboardData').not().isEmpty()
    .withMessage("Please fill dashboardData field with a valid value."),

    check('segment').not().isEmpty()
    .withMessage("Please fill segmant field with valid values ."),

    check('segment.name').not().isEmpty().isIn(names)
    .withMessage("Please fill segmant name  field with a valid value ."),
    
    // check('segment.segmentId').not().isEmpty().isMongoId()
    // .withMessage("Please fill segmantId field with a valid mongo Id ."),

    check('segment.options')
    .if((value,{req})=> req.body.segment.name !== 'superFan')
    .not().isEmpty()
    .withMessage("Please fill segmant options field with a valid values ."),
    
    check('segment.options.id')
    .if((value,{req})=> req.body.segment.name !== 'superFan')
    .not().isEmpty()
    .if((value,{req})=> req.body.segment.name === 'everyone')
    .isIn(everyone)
    .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.id')
    .if((value,{req})=> req.body.segment.name !== 'superFan')
    .not().isEmpty()
    .if((value,{req})=> req.body.segment.name === 'birthday')
    .isIn(birthday)
    .withMessage("Please fill segmant options field with a valid values ."),
    
    check('segment.options.id')
    .if((value,{req})=> req.body.segment.name !== 'superFan')
    .not().isEmpty()
    .if((value,{req})=> req.body.segment.name === 'newCustomers')
    .isIn(newCustomers)
    .withMessage("Please fill segmant options field with a valid values ."),
    
    check('segment.options.id')
    .if((value,{req})=> req.body.segment.name !== 'superFan')
    .not().isEmpty()
    .if((value,{req})=> req.body.segment.name === 'lostCustomers')
    .isIn(lostCustomers)
    .withMessage("Please fill segmant options field with a valid values ."),

    // check('segment.options.id').not().isEmpty()
    // .if((value,{req})=> req.body.segment.name === 'superFan')
    // .isIn(superFan)
    // .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.sendDate')
    .if((value,{req})=> sendNow.includes(req.body.segment.options.id))
    .isEmpty()
    .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.sendDate.startDate')
    .if((value,{req})=> rangeDates.includes(req.body.segment.options.id))
    .not().isEmpty().not().isBefore(currentDate)
    .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.sendDate.startDate')
    .if((value,{req})=> !rangeDates.includes(req.body.segment.options.id))
    .isEmpty()
    .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.sendDate.expirationDate')
    .if((value,{req})=> rangeDates.includes(req.body.segment.options.id))
    .not().isEmpty().not().isBefore(currentDate).custom((value,{req})=>{
        if(new Date(req.body.segment.options.sendDate.startDate) <= new Date(value)) return true
        else return false
    })
    .withMessage("Please fill segmant options field with a valid values ."),

    check('segment.options.sendDate.expirationDate')
    .if((value,{req})=> !rangeDates.includes(req.body.segment.options.id))
    .isEmpty()    
    .withMessage("Please fill segmant options field with a valid values ."),

    validator
]


const giftsCustomAddValidator =
[
    check('title').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title field with valid title, min 3 chars"),

    check('title_ar').not().isEmpty().isLength({ min: 3 })
    .withMessage("Please fill title_ar field with valid title, min 3 chars"),

    check('description').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('description_ar').not().isEmpty().isString()
    .withMessage("Please fill description with a valid value "),

    check('numOfValidDays').not().isEmpty().isNumeric()
    .withMessage("Please fill numOfValidDays field with a number."),
  
    check('discount').not().isEmpty().isNumeric()
    .withMessage("Please fill discount field with a number."),

    check('imageUrl').not().isEmpty().isArray()
    .withMessage("Please fill imageUrl field with a valid array of images ."),

    check('status').not().isEmpty().isIn(status)
    .withMessage("Please fill status field with a valid value ."),

    check('dashboardData').not().isEmpty()
    .withMessage("Please fill dashboardData field with a valid value."),

    check('customers').not().isEmpty().isArray()
    .withMessage("Please fill giftCustomers field with a valid value."),

    validator
]

module.exports={giftsUnpublishAndPublishValidator,giftsAddValidator,giftsCustomAddValidator}