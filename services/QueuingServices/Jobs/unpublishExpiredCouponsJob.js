const { Coupons } = require('../../../db/models/Coupons');

const couponServices = require('../../mainBackendServices/couponServices');

const { getCurrentJobName } = require('./jobHelpers');

const utilities = require('../../../utilities');

const jobName = getCurrentJobName(__filename);

const run = async (data) => {

    const coupons = await couponServices.getAllCouponsFromDb();

    if (!coupons && !coupons.length) throw 'no coupons found'

    const expiredCoupons = couponServices.couponToBeUpdated(coupons)

    if (!expiredCoupons && !expiredCoupons.length) return 'no expired Coupons';

    return await couponServices.changeCouponsToHistory(expiredCoupons);

}

module.exports = run;
