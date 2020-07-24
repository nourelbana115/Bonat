const { DashboardChart } = require('../../../db/models/DashboardCharts');
const dashboardServices = require('../../mainBackendServices/dashboardServices');
const customersServices = require('../../mainBackendServices/customersServices');
const couponServices = require('../../mainBackendServices/couponServices');
const giftsServices = require('../../mainBackendServices/giftsServices');
const { Merchant } = require('../../../db/models/merchant');
const logger = require('../../logger');

const getCouponChart = async (merchant) => {
  try {
    const response = await dashboardServices.getCoupons(merchant, dashboardServices.returnDateString(14), dashboardServices.returnDateString(0));
    response.forEach(oneDay => {
      oneDay.date = oneDay.date.slice(0, 5).split("/").reverse().join("/")
    })
    const couponStats = await couponServices.calculateSoldAndUsedCoupons(merchant);
    const totalSold = couponStats.reduce((total, coupon) => total + coupon.purchasedCoupons, 0);
    const totalUsed = couponStats.reduce((total, coupon) => total + coupon.usedCoupons, 0);
    return { 'chart': response, 'totalSold': totalSold, 'totalUsed': totalUsed }
  } catch (err) {
    logger.log('request', 'error', `failed getting coupon chart ${merchant._id} ${err}`, `Saving coupon chart`)
    return { 'chart': [], 'totalSold': 0, 'totalUsed': 0 }
  }
};

const getGiftChart = async (merchant) => {
  try {
    const response = await dashboardServices.getGifts(merchant, dashboardServices.returnDateString(14), dashboardServices.returnDateString(0));
    response.forEach(oneDay => {
      oneDay.date = oneDay.date.slice(0, 5).split("/").reverse().join("/")
      delete oneDay.giftSent
    })
    const giftStats = await giftsServices.getAllGiftStat(merchant);
    const totalUsed = giftStats.reduce((total, gift) => total + gift.amountOfUsedGifts, 0)
    return { 'chart': response, 'totalUsed': totalUsed };
  } catch (err) {
    logger.log('request', 'error', `failed getting gift chart ${merchant._id} ${err}`, `Saving gifts chart`)
    return { 'chart': [], 'totalUsed': 0 }
  }
};

const saveChart = async (merchant, type, chartData) => {
  try {
    const chart = { merchant: merchant._id, type: type, chartData: await chartData }
    const newChart = new DashboardChart(chart);
    await newChart.save()
  } catch (err) {
    logger.log('general', 'error', `failed saving chart for merchant ${merchant._id} ${err}`, `Saving ${type} chart`)
  }
}

const saveAllCharts = async () => {
  const merchants = await Merchant.find({})
  for (i in merchants) {
    saveChart(merchants[i], 'couponChart', getCouponChart(merchants[i]));
    saveChart(merchants[i], 'giftChart', getGiftChart(merchants[i]));
    saveChart(merchants[i], 'visitsPerCustomerChart', dashboardServices.calculateVisits(await customersServices.getCustomers(merchants[i])))
  }
}

const run = async (data) => {
  return await saveAllCharts();
}

module.exports = run