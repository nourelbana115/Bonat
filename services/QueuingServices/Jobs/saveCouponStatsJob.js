const couponServices = require('../../mainBackendServices/couponServices');
const { CouponStatistics } = require('../../../db/models/couponStatistics')
const { Merchant } = require('../../../db/models/merchant');
const logger = require('../../logger');

const saveCouponStat = async (merchant) => {
  try {
    const response = await couponServices.calculateCouponStats(merchant);
    for (couponStat of response) {
      const newStat = new CouponStatistics(couponStat)
      newStat.save()
    }
  } catch (err) {
    logger.log('general', 'error', `failed saving coupon stats for merchant ${merchant._id} ${err} NO COUPONS`, `saving coupon stats`)
  }
}

const saveAllStats = async () => {
  const merchants = await Merchant.find({});
  for (merchant of merchants) {
    saveCouponStat(merchant)
  }
}

const run = async (data) => {
  return await saveAllStats()
}

module.exports = run