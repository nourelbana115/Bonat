const { DashboardBranchChart } = require('../../../db/models/DashboardBranchCharts');
const dashboardServices = require('../../mainBackendServices/dashboardServices');
const { Merchant } = require('../../../db/models/merchant');
const logger = require('../../logger');

const saveBranchChart = async (serviceCharts, merchant) => {
  try {
    const charts = await serviceCharts
    for (chart of charts) {
      const newChart = {
        merchant: merchant._id,
        type: await chart.type,
        chartData: await chart.chartData,
        idBranch: await chart.idBranch
      }
      const saveChart = new DashboardBranchChart(newChart);
      await saveChart.save()
    }
  } catch(err) {
    logger.log('general', 'error', `failed saving branch chart for merchant ${merchant._id} ${err}`, `Saving ${type} chart`)
  }
}

const saveAllCharts = async () => {
  const merchants = await Merchant.find({})
  for (merchant of merchants) {
    saveBranchChart(dashboardServices.calculateVisitsBranch(merchant), merchant)
  }
}

const run = async (data) => {
  return await saveAllCharts();
}

module.exports = run