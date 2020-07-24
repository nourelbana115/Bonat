const { DashboardInsight } = require('../../../db/models/DashboardInsights');
const dashboardServices = require('../../mainBackendServices/dashboardServices');
const { Merchant } = require('../../../db/models/merchant');
const logger = require('../../logger')


const getDashboardInsights = async (merchant) => {
  return [
    await dashboardServices.getAverageAge(merchant),
    await dashboardServices.getAverageReturn(merchant),
    await dashboardServices.getMalePercentage(merchant),
    await dashboardServices.getFemalePercentage(merchant),
    await dashboardServices.getNoGenderPercentage(merchant),
    await dashboardServices.getAverageDailyVisits(merchant),
    await dashboardServices.getAllPayments(merchant),
    await dashboardServices.getPurchasedCoupons(merchant),
    await dashboardServices.getSentGifts(merchant),
    await dashboardServices.getAllRewardedCustomers(merchant)
  ]
}

const saveInsight = async (merchant) => {
  try {
    const insights = await getDashboardInsights(merchant)
    for (insight of insights) {
      insight.merchant = merchant._id
      const newInsight = new DashboardInsight(insight)
      await newInsight.save();
    }
  } catch (err) {
    logger.log('general', 'error', `failed saving insights for merchant ${merchant._id} ${err}`, 'Saving all insights')
  }
}

const saveDashboardInsights = async () => {
  const merchants = await Merchant.find({})
  for (merchant of merchants) {
    await saveInsight(merchant)
  }
}



const run = async (data) => {
  return await saveDashboardInsights();
}

module.exports = run