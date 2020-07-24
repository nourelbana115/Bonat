const { DashboardBranchInsight } = require('../../../db/models/DashboardBranchInsights');
const dashboardServices = require('../../mainBackendServices/dashboardServices');
const { Merchant } = require('../../../db/models/merchant');
const logger = require('../../logger')

const saveInsight = async (insight, merchant) => {
  try {
    const insights = await insight
    for (insight of insights) {
      insight.merchant = merchant._id
      const newInsight = new DashboardBranchInsight(insight)
      await newInsight.save();
    }
  } catch (err) {
    logger.log('general', 'error', `failed saving branch insight for merchant ${merchant._id} ${err}`, `Saving ${insight} branch`)
  }
}

const saveDashboardBranchInsights = async () => {
  const merchants = await Merchant.find({})
  for (merchant of merchants) {
    await saveInsight(dashboardServices.getAllPaymentsBranch(merchant), merchant)
    await saveInsight(dashboardServices.getAverageReturnBranch(merchant), merchant)
    await saveInsight(dashboardServices.getAverageAgeBranch(merchant), merchant)
    await saveInsight(dashboardServices.getMalePercentageBranch(merchant), merchant)
    await saveInsight(dashboardServices.getFemalePercentageBranch(merchant), merchant)
    await saveInsight(dashboardServices.getNoGenderPercentageBranch(merchant), merchant)
    await saveInsight(dashboardServices.getAverageVisitsBranch(merchant), merchant)
  }
}

const run = async (data) => {
  return await saveDashboardBranchInsights();
}

module.exports = run