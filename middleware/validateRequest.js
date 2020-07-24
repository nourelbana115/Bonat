const { validationResult} = require('express-validator');
const {generalResponse} = require('../requests/helpers/responseBody');
const validator =  (req, res, next) => {
    const errors = validationResult(req);
    return (!errors.isEmpty())?res.status(400).jsonp(generalResponse({},errors.array(),"")):next();
}

module.exports = {validator};