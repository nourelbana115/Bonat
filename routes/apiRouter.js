
const gifts = require('./gifts')
const coupons = require('./coupons')
const loyaltyProgram = require('./loyaltyProgram')
const segments = require('./segments')
const customers = require('./customers')
const sales = require('./sales')
const merchant = require('./merchant')
const ads = require('./ads')



module.exports = function (app){
    // merchant
    app.use('/merchant', merchant);
    // gifts
    app.use('/merchant/gifts', gifts);

    // coupons
    app.use('/merchant/coupon', coupons);

    // loyalty programs
    app.use('/merchant/program', loyaltyProgram);

    // segments
    app.use('/merchant/segments', segments.router)

    // sales
    app.use('/merchant/sales', sales)

    // customers
    app.use('merchant/customer', customers)

    // ads
    app.use('merchant/ads', ads);

}