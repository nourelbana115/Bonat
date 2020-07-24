const axios = require('axios');
const logger = require('../logger');
const couponServices = require('./couponServices');
const giftsServices = require('./giftsServices');
const { getCustomers, getCustomersFeedBack, getDatabaseCustomers, getBranchCustomers } = require('./customersServices')
const { feedback } = require('../../db/models/feedbackStatistics');
const { DailyVisit } = require('../../db/models/DailyVisits');
const segmentServices = require('../mainBackendServices/segmentsServices')
const { Merchant } = require('../../db/models/merchant');
const customerServices = require('./customersServices')
const loyaltyPorgram = require('./loyaltyProgramsServices')

const { DashboardInsight } = require('../../db/models/DashboardInsights');
const { DashboardBranchInsight } = require('../../db/models/DashboardBranchInsights');
const { DashboardChart } = require('../../db/models/DashboardCharts');
const { DashboardBranchChart } = require('../../db/models/DashboardBranchCharts');

// Get all visits in the last month

const returnDateString = (days) => {
  const currentDate = new Date();
  const requiredDate = new Date(currentDate - (1000 * 24 * 60 * 60 * days));
  return `${requiredDate.getFullYear()}-${(requiredDate.getMonth() + 1)}-${requiredDate.getDate()}`
};

const getVisits = (merchant, days) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}visit?starting_date=${returnDateString(days)}&end_date=${returnDateString(0)}`;
    let config = {
      headers: {
        "Authorization": `Bearer ${merchant.token}`
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Last Month Visits')
        return reject(err)
      });
  })
};

const getBranchNames = async (merchant) => {
  try {
    const response = await getBranches(merchant)
    const list = response.map(({ idBranch, district, managerName }) => ({ idBranch, district, managerName }))
    return list
  } catch (err) {
    logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get merchant branches names')
    return []
  }
}

const returnVisitChartObject = (label, min, max, value) => {
  return {
    label: label,
    min: min,
    max: max,
    value: value
  }
}

const calculateVisits = async (customers) => {
  try {
    const visits1 = customers.filter(customer => customer.visits == 1).length;
    const visits2_3 = customers.filter(customer => 2 <= customer.visits && customer.visits <= 3).length;
    const visits4_7 = customers.filter(customer => 4 <= customer.visits && customer.visits <= 7).length;
    const visits8_15 = customers.filter(customer => 8 <= customer.visits && customer.visits <= 15).length;
    const visits16_25 = customers.filter(customer => 16 <= customer.visits && customer.visits <= 25).length;
    const visits26_49 = customers.filter(customer => 26 <= customer.visits && customer.visits <= 49).length;
    const visits50 = customers.filter(customer => 50 <= customer.visits).length;
    const visitsChart = [
      returnVisitChartObject('1 visit', null, 1, visits1),
      returnVisitChartObject('2-3 visits', 2, 3, visits2_3),
      returnVisitChartObject('4-7 visits', 4, 7, visits4_7),
      returnVisitChartObject('8-15 visits', 8, 15, visits8_15),
      returnVisitChartObject('16-25 visits', 16, 25, visits16_25),
      returnVisitChartObject('26-49 visits', 26, 49, visits26_49),
      returnVisitChartObject('+50 visits', 50, null, visits50)
    ]
    return await visitsChart
  } catch (err) {
    return [
      returnVisitChartObject('1 visit', null, 1, 0),
      returnVisitChartObject('2-3 visits', 2, 3, 0),
      returnVisitChartObject('4-7 visits', 4, 7, 0),
      returnVisitChartObject('8-15 visits', 8, 15, 0),
      returnVisitChartObject('16-25 visits', 16, 25, 0),
      returnVisitChartObject('26-49 visits', 26, 49, 0),
      returnVisitChartObject('+50 visits', 50, null, 0)
    ]
  }
}

const calculateVisitsBranch = async (merchant) => {
  try {
    const idBranchs = await getBranchIds(merchant);
    let charts = []
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      const visits1 = response.filter(customer => customer.visits == 1).length;
      const visits2_3 = response.filter(customer => 2 <= customer.visits && customer.visits <= 3).length;
      const visits4_7 = response.filter(customer => 4 <= customer.visits && customer.visits <= 7).length;
      const visits8_15 = response.filter(customer => 8 <= customer.visits && customer.visits <= 15).length;
      const visits16_25 = response.filter(customer => 16 <= customer.visits && customer.visits <= 25).length;
      const visits26_49 = response.filter(customer => 26 <= customer.visits && customer.visits <= 49).length;
      const visits50 = response.filter(customer => 50 <= customer.visits).length;
      const visitsChart = {
        type: 'visitsPerCustomerChart',
        chartData: [
          returnVisitChartObject('1 visit', null, 1, visits1),
          returnVisitChartObject('2-3 visits', 2, 3, visits2_3),
          returnVisitChartObject('4-7 visits', 4, 7, visits4_7),
          returnVisitChartObject('8-15 visits', 8, 15, visits8_15),
          returnVisitChartObject('16-25 visits', 16, 25, visits16_25),
          returnVisitChartObject('26-49 visits', 26, 49, visits26_49),
          returnVisitChartObject('+50 visits', 50, null, visits50)
        ],
        idBranch: idBranch
      }
      charts.push(visitsChart)
    }
    return charts
  }
  catch (err) {
    return [
      returnVisitChartObject('1 visit', null, 1, 0),
      returnVisitChartObject('2-3 visits', 2, 3, 0),
      returnVisitChartObject('4-7 visits', 4, 7, 0),
      returnVisitChartObject('8-15 visits', 8, 15, 0),
      returnVisitChartObject('16-25 visits', 16, 25, 0),
      returnVisitChartObject('26-49 visits', 26, 49, 0),
      returnVisitChartObject('+50 visits', 50, null, 0)
    ]
  }
}

const returnCachedVisitsPerCustomerChart = ({ merchant, idBranch }) => {
  if (idBranch) {
    return new Promise((resolve, reject) => {
      DashboardBranchChart.findOne({ merchant: merchant._id, type: 'visitsPerCustomerChart', idBranch: idBranch }).sort({ createdAt: -1 })
        .then(response => {
          return resolve({ chart: response.chartData })
        })
        .catch(err => {
          logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get cached visits per customer chart')
          return resolve({
            chart: [
              returnVisitChartObject('1 visit', null, 1, 0),
              returnVisitChartObject('2-3 visits', 2, 3, 0),
              returnVisitChartObject('4-7 visits', 4, 7, 0),
              returnVisitChartObject('8-15 visits', 8, 15, 0),
              returnVisitChartObject('16-25 visits', 16, 25, 0),
              returnVisitChartObject('26-49 visits', 26, 49, 0),
              returnVisitChartObject('+50 visits', 50, null, 0)
            ]
          })
        })
    })
  } else {
    return new Promise((resolve, reject) => {
      DashboardChart.findOne({ merchant: merchant._id, type: 'visitsPerCustomerChart' }).sort({ createdAt: -1 })
        .then(response => {
          return resolve({ chart: response.chartData })
        })
        .catch(err => {
          logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get cached visits per customer chart')
          return resolve({
            chart: [
              returnVisitChartObject('1 visit', null, 1, 0),
              returnVisitChartObject('2-3 visits', 2, 3, 0),
              returnVisitChartObject('4-7 visits', 4, 7, 0),
              returnVisitChartObject('8-15 visits', 8, 15, 0),
              returnVisitChartObject('16-25 visits', 16, 25, 0),
              returnVisitChartObject('26-49 visits', 26, 49, 0),
              returnVisitChartObject('+50 visits', 50, null, 0)
            ]
          })
        })
    })
  }

}

const findDashboardBranchChartDailyVisits = (merchant, idBranch) => {
  return new Promise((resolve, reject) => {
    let date = new Date()
    let startingDate = new Date(date - (1000 * 24 * 60 * 60 * 14)); // TO get last 14 days

    DashboardBranchChart.find({
      merchant: merchant._id, type: 'dailyVisits', idBranch: idBranch,
      createdAt: { $gte: startingDate, $lte: date }
    })
      .then(response => {
        return resolve(response)
      })
      .catch(err => {
        logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get cached visits chart branch')
        return reject(err)
      })
  })
}

const getCoupons = (merchant, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}coupons?starting_date=${startDate}&end_date=${endDate}`;
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Coupons Chart')
        return resolve([])
      });
  })
};

const returnCachedCouponsChart = (merchant) => {
  return new Promise((resolve, reject) => {
    DashboardChart.findOne({ merchant: merchant._id, type: 'couponChart' }).sort({ createdAt: -1 })
      .then(response => {
        return resolve(response.chartData)
      })
      .catch(err => {
        return resolve({ 'chart': [], 'totalSold': 0, 'totalUsed': 0 })
      })
  })
}


const getGifts = (merchant, startDate, endDate) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}gifts?starting_date=${startDate}&end_date=${endDate}`;
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Used Gifts Chart')
        return resolve([])
      });
  })
};

const returnCachedGiftsChart = (merchant) => {
  return new Promise((resolve, reject) => {
    DashboardChart.findOne({ merchant: merchant._id, type: 'giftChart' }).sort({ createdAt: -1 })
      .then(response => {
        return resolve(response.chartData)
      })
      .catch(err => {
        return resolve({ 'chart': [], 'totalUsed': 0 })
      })
  })
}

const getStatistics = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}getLoyaltyStat/`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Statstics For Dashboard')
        return reject(err)
      });
  })
};

// Insights
const returnInsight = (type, label, value, priority) => {
  return {
    type: type,
    label: label,
    value: value,
    priority: priority
  }
};

// Get the average return per customer
const getAverageReturn = async function (merchant) {
  try {
    const response = await getCustomers(merchant);
    if (response.length) {
      const total = response.reduce((total, customer) => total + customer.visits, 0);
      const avgerageReturn = total / response.length;
      return returnInsight('averageReturn', 'Average customers return', Math.round(avgerageReturn), 2)
    }
    return returnInsight('averageReturn', 'Average customers return', 0, 2)
  } catch (err) {
    return returnInsight('averageReturn', 'Average customers return', 'No record for this day', 2);
  }
};

// Get daily visits in the last month
const getAverageDailyVisits = async function (merchant) {
  try {
    const response = await getVisits(merchant, 29);
    const lastMonthVisits = response.length;
    const averageDailyVisits = lastMonthVisits / 30;
    return returnInsight('averageVisits', 'Average daily visits in the last month', Math.round(averageDailyVisits), 3);
  } catch (err) {
    return returnInsight('averageVisits', 'Average daily visits in the last month', 'No record for this day', 3);
  }
};

// Get all payments by customers
const getAllPayments = async function (merchant) {
  try {
    let amount = 0;
    const response = await getCustomers(merchant)
    if (response.length) {
      amount = response.reduce((total, customer) => total + JSON.parse(customer.payments), 0);
      return returnInsight('customerPayments', 'Total income from customers', Math.round(amount), 1);
    }
    return returnInsight('customerPayments', 'Total income from customers', 0, 1);
  } catch (err) {
    return returnInsight('customerPayments', 'Total income from customers', 'No record for this day', 1);
  }
};

// Get all purchased coupons
const getPurchasedCoupons = async (merchant) => {
  try {
    const response = await couponServices.calculateSoldAndUsedCoupons(merchant)
    if (response) {
      const total = response.reduce((total, coupon) => total + coupon.purchasedCoupons, 0);
      return returnInsight('purchasedCoupons', 'Total coupons purchased by customers', Math.round(total), 4);
    }
    return returnInsight('purchasedCoupons', 'Total coupons purchased by customers', 0, 4);
  } catch (err) {
    logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'purchased coupons')
    return returnInsight('purchasedCoupons', 'Total coupons purchased by customers', 'No record for this day', 4);
  }
};

// Get all sent gifts
const getSentGifts = async function (merchant) {
  try {
    const response = await giftsServices.getAllGiftStat(merchant);
    const total = response.reduce((total, gift) => total + gift.amountOfSentGifts, 0);
    return returnInsight('sentGifts', 'Total gifts sent', Math.round(total), 5);
  } catch (err) {
    return returnInsight('sentGifts', 'Total gifts sent', 'No record for this day', 5);
  }
};

// Get all customers rewarded from loyalty programs
const getAllRewardedCustomers = async function (merchant) {
  try {
    const response = await getStatistics(merchant);
    const total = response.reduce((total, program) => total + program.numberOfRewardsEarned, 0);
    return returnInsight('rewardedCustomers', 'Total customers rewarded from loyalty programs', Math.round(total), 6);
  } catch (err) {
    return returnInsight('rewardedCustomers', 'Total customers rewarded from loyalty programs', 'No record for this day', 6);
  }
};

// Get average age
const getAverageAge = async function (merchant) {
  try {
    const response = await getCustomers(merchant);
    if (response.length) {
      const list = response.filter(customer => customer.age != null);
      const total = list.reduce((total, customer) => total + customer.age, 0);
      const averageAge = total / list.length;
      return returnInsight('averageAge', 'Average customers age', Math.round(averageAge), 7);
    }
    return returnInsight('averageAge', 'Average customers age', 0, 7);
  } catch (err) {
    return returnInsight('averageAge', 'Average customers age', 'No record for this day', 7);
  }
};

// Get male percentage
const getMalePercentage = async function (merchant) {
  try {
    const response = await getCustomers(merchant);
    if (response.length) {
      const total = response.filter(customer => customer.gender === 'Male');
      const malePercentage = total.length * 100 / response.length;
      return returnInsight('malePercentage', 'Male customers percentage', `${Math.round(malePercentage)}%`, 8);
    }
    return returnInsight('malePercentage', 'Male customers percentage', '0%', 8);
  } catch (err) {
    return returnInsight('malePercentage', 'Male customers percentage', 'No record for this day', 8);
  }
};

// Get female percentage
const getFemalePercentage = async function (merchant) {
  try {
    const response = await getCustomers(merchant);
    if (response.length) {
      const total = response.filter(customer => customer.gender === 'Female');
      const femalePercentage = total.length * 100 / response.length;
      return returnInsight('femalePercentage', 'Female customers percentage', `${Math.round(femalePercentage)}%`, 9);
    }
    return returnInsight('femalePercentage', 'Female customers percentage', '0%', 9);
  } catch (err) {
    return returnInsight('femalePercentage', 'Female customers percentage', 'No record for this day', 9);
  }
};

// Get customers who didn't choose gender percentage
const getNoGenderPercentage = async function (merchant) {
  try {
    const response = await getCustomers(merchant);
    if (response.length) {
      const total = response.filter(customer => customer.gender !== 'Male' && customer.gender !== 'Female');
      const percentage = total.length * 100 / response.length;
      return returnInsight('noGenderPercentage', 'Customers who did not choose gender percentage', `${Math.round(percentage)}%`, 10);
    }
    return returnInsight('noGenderPercentage', 'Customers who did not choose gender percentage', '0%', 10);
  } catch (err) {
    return returnInsight('noGenderPercentage', 'Customers who did not choose gender percentage', 'No record for this day', 10);
  }
};

const returnCachedInsights = ({ merchant, idBranch }) => {
  if (idBranch) {
    const insightsType = [
      'customerPayments',
      'averageReturn',
      'averageVisits',
      'averageAge',
      'malePercentage',
      'femalePercentage',
      'noGenderPercentage'
    ]
    return Promise.all(
      insightsType.map(insightType => {
        return new Promise((resolve, reject) => {
          DashboardBranchInsight.findOne({ merchant: merchant._id, type: insightType, idBranch: idBranch }).sort({ createdAt: -1 })
            .then((insight) => {
              if (insight) {
                return resolve(insight)
              }
              return resolve(returnBranchInsight(insightType, `No ${insightType} record exists`, 'No record', 10, idBranch))
            })
            .catch((err) => {
              return resolve(returnBranchInsight(insightType, `No ${insightType} record exists`, 'No record', 10, idBranch))
            })
        })
      })
    )
  } else {
    const insightsType = [
      'customerPayments',
      'averageReturn',
      'averageVisits',
      'purchasedCoupons',
      'sentGifts',
      'rewardedCustomers',
      'averageAge',
      'malePercentage',
      'femalePercentage',
      'noGenderPercentage'
    ]
    return Promise.all(
      insightsType.map(insightType => {
        return new Promise((resolve, reject) => {
          DashboardInsight.findOne({ merchant: merchant._id, type: insightType }).sort({ createdAt: -1 })
            .then((insight) => {
              if (insight) {
                return resolve(insight)
              }
              return resolve(returnInsight(insightType, `No ${insightType} record exists`, 'No record', 10))
            })
            .catch((err) => {
              return resolve(returnInsight(insightType, `No ${insightType} record exists`, 'No record', 10))
            })
        })
      })
    )
  }
};

// Branch Based Insights

const returnBranchInsight = (type, label, value, priority, idBranch) => {
  return {
    type: type,
    label: label,
    value: value,
    priority: priority,
    idBranch: idBranch
  }
};

const getAllPaymentsBranch = async (merchant) => {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getMerchantData(merchant);
      const branchIncomes = response.branch_income
      if (branchIncomes.length) {
        const requiredBranch = branchIncomes.filter(branch => branch.idBranch === idBranch)[0]
        amount = JSON.parse(requiredBranch.totalIncome)
        insights.push(returnBranchInsight('customerPayments', 'Total income from customers', Math.round(amount), 1, idBranch));
      } else {
        insights.push(returnBranchInsight('customerPayments', 'Total income from customers', 0, 1, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('customerPayments', 'Total income from customers', 'No record for this day', 1, idBranch));
    }
    return failedInsights;
  }
};

const getAverageVisitsBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getVisits(merchant, 29);
      if (response.length) {
        const list = response.filter(visit => visit.idBranch === idBranch)
        const lastMonthVisits = list.length;
        const averageDailyVisits = lastMonthVisits / 30;
        insights.push(returnBranchInsight('averageVisits', 'Average daily visits in the last month', Math.round(averageDailyVisits), 3, idBranch));
      } else {
        insights.push(returnBranchInsight('averageVisits', 'Average daily visits in the last month', 0, 3, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('averageVisits', 'Average daily visits in the last month', 'No record for this day', 3, idBranch));
    }
    return failedInsights;
  }
};

const getAverageReturnBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      if (response.length) {
        const total = response.reduce((total, customer) => total + customer.visits, 0);
        const avgerageReturn = total / response.length;
        insights.push(returnBranchInsight('averageReturn', 'Average customers return', Math.round(avgerageReturn), 2, idBranch));
      } else {
        insights.push(returnBranchInsight('averageReturn', 'Average customers return', 0, 2, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('averageReturn', 'Average customers return', 'No record for this day', 2, idBranch));
    }
    return failedInsights;
  }
};

const getAverageAgeBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      if (response.length) {
        const list = response.filter(customer => customer.age != null);
        const total = list.reduce((total, customer) => total + customer.age, 0);
        const averageAge = total / list.length;
        insights.push(returnBranchInsight('averageAge', 'Average customers age', Math.round(averageAge), 7, idBranch));
      } else {
        insights.push(returnBranchInsight('averageAge', 'Average customers age', 0, 7, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranch = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('averageAge', 'Average customers age', 'No record for this day', 7, idBranch));
    }
    return failedInsights;
  }
};

const getMalePercentageBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      if (response.length) {
        const total = response.filter(customer => customer.gender === 'Male');
        const malePercentage = total.length * 100 / response.length;
        insights.push(returnBranchInsight('malePercentage', 'Male customers percentage', `${Math.round(malePercentage)}%`, 8, idBranch));
      } else {
        insights.push(returnBranchInsight('malePercentage', 'Male customers percentage', '0%', 8, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('malePercentage', 'Male customers percentage', 'No record for this day', 8, idBranch));
    }
    return failedInsights;
  }
};

const getFemalePercentageBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      if (response.length) {
        const total = response.filter(customer => customer.gender === 'Female');
        const femalePercentage = total.length * 100 / response.length;
        insights.push(returnBranchInsight('femalePercentage', 'Female customers percentage', `${Math.round(femalePercentage)}%`, 8, idBranch));
      } else {
        insights.push(returnBranchInsight('femalePercentage', 'Female customers percentage', '0%', 8, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranchs) {
      failedInsights.push(returnBranchInsight('malePercentage', 'Male customers percentage', 'No record for this day', 8, idBranch));
    }
    return failedInsights;
  }
};

const getNoGenderPercentageBranch = async function (merchant) {
  try {
    const idBranchs = await getBranchIds(merchant);
    let insights = [];
    for (idBranch of idBranchs) {
      const response = await getBranchCustomers(merchant, idBranch);
      if (response.length) {
        const total = response.filter(customer => customer.gender !== 'Male' && customer.gender !== 'Female');
        const percentage = total.length * 100 / response.length;
        insights.push(returnBranchInsight('noGenderPercentage', 'Customers who did not choose gender percentage', `${Math.round(percentage)}%`, 10, idBranch));
      } else {
        insights.push(returnBranchInsight('noGenderPercentage', 'Customers who did not choose gender percentage', '0%', 10, idBranch));
      }
    }
    return insights;
  } catch (err) {
    const idBranchs = await getBranchIds(merchant);
    let failedInsights = [];
    for (idBranch of idBranch) {
      failedInsights.push(returnBranchInsight('noGenderPercentage', 'Customers who did not choose gender percentage', 'No record for this day', 10, idBranch));
    }
    return failedInsights;
  }
}

// time based insights

const getAllPaymentsRange = async (merchant, startDate, endDate) => {
  try {
    let amount = 0
    const response = await getCustomers(merchant);
    if (response.length) {
      const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
      amount = list.reduce((total, customer) => total + JSON.parse(customer.payments), 0);
    }
    return returnInsight('customerPayments', 'Total income from customers', Math.round(amount), 1);
  } catch (err) {
    return { 'Error': 'Getting payments ' + err }
  }
};

const getAverageReturnRange = async (merchant, startDate, endDate) => {
  try {
    const response = await getCustomers(merchant);
    const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
    if (list.length) {
      const total = list.reduce((total, customer) => total + customer.visits, 0);
      const avgerageReturn = total / list.length;
      return returnInsight('averageReturn', 'Average customers return', Math.round(avgerageReturn), 2);
    }
    return returnInsight('averageReturn', 'Average customers return', 0, 2)
  } catch (err) {
    return { 'Error': 'Getting average return ' + err }
  }
};

const getMalePercentageRange = async (merchant, startDate, endDate) => {
  try {
    const response = await getCustomers(merchant);
    const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
    if (list.length) {
      const total = list.filter(customer => customer.gender === 'Male');
      const malePercentage = total.length * 100 / list.length;
      return returnInsight('malePercentage', 'Male customers percentage', `${Math.round(malePercentage)}%`, 8);
    }
    return returnInsight('malePercentage', 'Male customers percentage', '0%', 8);
  } catch (err) {
    return { 'Error': 'Getting male percentage ' + err }
  }
};

const getFemalePercentageRange = async (merchant, startDate, endDate) => {
  try {
    const response = await getCustomers(merchant);
    const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
    if (list.length) {
      const total = list.filter(customer => customer.gender !== 'Male' && customer.gender !== 'Female');
      const femalePercentage = total.length * 100 / list.length;
      return returnInsight('femalePercentage', 'Female customers percentage', `${Math.round(femalePercentage)}%`, 9);
    }
    return returnInsight('femalePercentage', 'Female customers percentage', '0%', 9);
  } catch (err) {
    return { 'Error': 'Getting male percentage ' + err }
  }
};

const getNoGenderPercentageRange = async (merchant, startDate, endDate) => {
  try {
    const response = await getCustomers(merchant);
    const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
    if (list.length) {
      const total = list.filter(customer => customer.gender === 'Female');
      const percentage = total.length * 100 / list.length;
      return returnInsight('noGenderPercentage', 'Customers who did not choose gender percentage', `${Math.round(percentage)}%`, 10);
    }
    return returnInsight('noGenderPercentage', 'Customers who did not choose gender percentage', '0%', 10);
  } catch (err) {
    return { 'Error': 'Getting male percentage ' + err }
  }
};

const getAverageAgeRange = async (merchant, startDate, endDate) => {
  try {
    const response = await getCustomers(merchant);
    const list = response.filter(customer => new Date(customer.lastVisit) > new Date(startDate) && new Date(customer.lastVisit) < new Date(endDate));
    if (list.length) {
      const customersWithAge = list.filter(customer => customer.age != null);
      const total = customersWithAge.reduce((total, customer) => total + customer.age, 0);
      const averageAge = total / customersWithAge.length;
      return returnInsight('averageAge', 'Average customers age', Math.round(averageAge), 7)
    }
    return returnInsight('averageAge', 'Average customers age', 0, 7);
  } catch (err) {
    return { 'Error': 'Getting average age ' + err }
  }
};


const getPurchasedCouponsRange = async (req, startDate, endDate) => {
  try {
    const response = await getCoupons(req, startDate, endDate)
    const total = response.reduce((total, coupon) => total + coupon.couponBought, 0)
    return returnInsight('purchasedCoupons', 'Total coupons purchased by customers', Math.round(total), 4);
  } catch (err) {
    return { 'Error': 'Getting purchased coupons ' + err }
  }
}

const getSentGiftsRange = async (req, startDate, endDate) => {
  try {
    const response = await getGifts(req, startDate, endDate)
    const total = response.reduce((total, gift) => total + gift.giftSent, 0)
    return returnInsight('sentGifts', 'Total gifts sent to customers', Math.round(total), 5);
  } catch (err) {
    return { 'Error': 'Getting sent gifts ' + err }
  }
}

// used in get general 

const getNewAndAllCustomers = (req) => {
  let merchant = req.merchant
  return new Promise((resolve, reject) => {
    let bonatCustomer = {
      type: "bonatCustomers",
      label: "current and new customers",
      items: [{
        label: "number of customers",
        value: 0,

      },
      {
        label: "number of new customers",
        value: 0,
      }],
    }
    let segments = ['everyone']
    segmentServices.getSpecificSegments(merchant, segments)
      .then((response) => {
        if (!response.length) resolve(bonatCustomer)
        else {
          let segmentData = response[0].segmentData
          bonatCustomer.items[0].value = segmentData.allCustomers.value
          bonatCustomer.items[1].value = segmentData.registeredThisMonth.value
          return resolve(bonatCustomer)
        }
      })
      .catch((err) => reject(err))
  })
}


// get merchant balance
const getMerchantData = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}merchant`;
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        return resolve(response.data.data[0])
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Merchant Balance')
        return reject(err)
      });
  })
}
const getMerchantBalance = (req) => {
  return new Promise((resolve, reject) => {
    findFromMerchantModel({ _id: req.merchant._id })
      .then((response) => {
        let balance = !response.balance ? null : response.balance;
        return resolve(balance)
      })
      .catch((error) => reject(error))
  })
}
const findFromMerchantModel = (query) => {
  return new Promise((resolve, reject) => {

    Merchant.findOne(query)

      .then((response) => resolve(response))

      .catch(error => {
        logger.log('requests', 'error', `${error} for merchant: ${merchant.idMerchant}`, 'Get Merchant Data')

        return reject(error)
      })
  })
}

const updateMerchantModel = (query, updateObj) => {
  return new Promise((resolve, reject) => {

    Merchant.findOneAndUpdate(query, updateObj, { new: true, useFindAndModify: false })

      .exec()

      .then((merchant) => resolve(merchant))

      .catch(error => {
        logger.log('requests', 'error', `${error} for merchant: ${merchant.idMerchant}`, 'Get Merchant Data')

        return reject(error)
      });
  })

}
const updateMerchantInfo = async (merchant) => {

  const merchantData = await getMerchantData(merchant)
  const branchIncomes = merchantData.branch_income
  const pointsEarned = branchIncomes.reduce((total, branch) => total + branch.pointsEarned, 0);

  let balance = !merchantData.balance ? 0 : parseFloat(merchantData.balance)

  return await updateMerchantModel(
    { _id: merchant._id },
    {
      $set: {
        balance: balance,
        pointsGiven: merchantData.PointsGiven,
        pointsRedeemed: merchantData.PointsRedeemed,
        pointsEarned: pointsEarned,
        idLoyaltyType: merchantData.idLoyaltyType,
        idSubscription: merchantData.idSubscription
      }
    }
  );
}
const getGeneralData = (req) =>{
  let final = {}
  let merchantData = req.merchant;
  return new Promise((resolve,reject)=>{
    Promise.all([
      getNewAndAllCustomers(req),
      loyaltyPorgram.getLoyaltyPorgramDate(merchantData),
      customerServices.getTotalCommentsAndRate(req),
      returnPoints(merchantData),
      getMerchantBalance(req)])
      .then((reslut) => {
  
        let [bonatCustomers, activeSince, feedback, merchantPoints, balance] = reslut
        final =
          {
            "quickActions": [bonatCustomers, feedback, merchantPoints, activeSince],
            "customerBalance": balance
          }
        return resolve(final)
  
      })
      .catch((err) => reject(err))
  
  })
 
}

const returnPoints = async (merchant) => {
  try {
    const merchantData = await Merchant.findById(merchant._id)
    if (merchantData.pointsRedeemed && merchantData.pointsEarned && merchantData.idLoyaltyType) {
      return await {
        "type": "merchantPoints",
        "label": "Points Status",
        "items": [
          {
            "label": "Number of Earned Points",
            "value": merchantData.pointsEarned
          },
          {
            "label": "Number of Redeemed Points",
            "value": merchantData.pointsRedeemed
          }
        ]
      }
    } else {
      return await {
        "type": "merchantPoints",
        "label": "Earned and Redeemed points",
        "items": [
          {
            "label": "Earned Points",
            "value": 'Unknown'
          },
          {
            "label": "Redeemed Points",
            "value": 'Unknown'
          }
        ]
      }
    }
  } catch (err) {
    logger.log('requests', 'error', err, 'Returning merchant Points')
  }

}

//end of what used in general function




// start of feedback statistics 
const findFromFeedbackStatisticsModel = (merchant) => {
  return new Promise((resolve, reject) => {
    feedback.find({ merchant: merchant._id })
      .then((feedback) => resolve(feedback))
      .catch((error) => {
        logger.log('requests', 'error', `${error} for merchant: ${merchant.idMerchant}`, 'Find feedbackStatistics data ')

        return reject(error)
      })
  })
}
const sortfeedback = (feedbackArray) => {
  let sortedFeedback = []
  feedbackArray.map((element) => {
    switch (element.label) {
      case 'very bad':
        sortedFeedback[0] = element
        break;

      case 'bad':
        sortedFeedback[1] = element
        break;

      case 'normal':
        sortedFeedback[2] = element

        break;

      case 'happy':
        sortedFeedback[3] = element

        break;

      case 'very happy':
        sortedFeedback[4] = element

        break;
      default:
        break;


    }
  })
  return sortedFeedback

}
const formatFeedBackObject = (feedback) => {
  let feedbackWithDecOrInc = []
  let formatedFeedBack = {}

  feedback.map((element) => {
    formatedFeedBack = {
      type: element.type,
      label: element.label,
      percentage: element.percentage,
      amount: element.amount,
      increase: Math.sign(element.percentageDiff) === -1 ? Math.abs(element.percentageDiff) : null,
      decrease: Math.sign(element.percentageDiff) === 1 ? element.percentageDiff : null,
    }
    feedbackWithDecOrInc.push(formatedFeedBack)

  })
  return feedbackWithDecOrInc
}
const formatFeedBack = (response, errors, message) => {
  let feedback = formatFeedBackObject(response)
  let sortedFeedback = sortfeedback(feedback)

  return {

    feedback: sortedFeedback,
    errors: errors,
    message: message
  }
}
// 

//find data from db 
const findFromDailyVisitModel = (merchant, date) => {
  return new Promise((resolve, reject) => {

    let startingDate = new Date(date - (1000 * 24 * 60 * 60 * 14)); // TO get last 14 days

    DailyVisit.find({ merchant: merchant._id, visitDate: { $gte: startingDate, $lte: date } })

      .then((docs) => resolve(docs))

      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Find Daily Vistis ')
        return reject(err)
      })

  })
}
const calculateNewAndReturnCustomers = (dailyVisits) => {
  let sumNewCustomers = 0, sumReturnCustomers = 0;
  dailyVisits.map((element) => {
    sumNewCustomers += element.newCustomers
    sumReturnCustomers += element.returnCustomers
  })
  return { sumNewCustomers, sumReturnCustomers }
}
const findAllDailyData = (req, date) => {
  return new Promise((resolve, reject) => {
    let visitData = {
      totalReturnCustomers: 0,
      totalNewCustomers: 0,
      visits: []
    }

    findFromDailyVisitModel(req.merchant, date)
      .then((docs) => {
        if (!docs.length) return resolve(visitData)
        else {

          let { sumNewCustomers, sumReturnCustomers } = calculateNewAndReturnCustomers(docs);
          if (sumNewCustomers > 0 || sumReturnCustomers > 0) {
            visitData.totalNewCustomers = sumNewCustomers;
            visitData.totalReturnCustomers = sumReturnCustomers
            visitData.visits = docs
          }
          return resolve(visitData)



        }
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Find Daily Vistis ')

        return reject(err)
      })

  })
}
const findBranchBasedDailyData = (req) => {
  return new Promise((resolve, reject) => {
    let visitData = {
      idBranch:req.query.idBranch,
      totalReturnCustomers: 0,
      totalNewCustomers: 0,
      visits: []
    }
    let idBranch = req.query.idBranch
    findDashboardBranchChartDailyVisits(req.merchant, idBranch)
      .then((docs) => {
        if (!docs.length) return resolve(visitData)
        else {
          let visits = docs.map(obj => obj.chartData)
          let { sumNewCustomers, sumReturnCustomers } = calculateNewAndReturnCustomers(visits);
          if (sumNewCustomers > 0 || sumReturnCustomers > 0) {
            visitData.totalNewCustomers = sumNewCustomers;
            visitData.totalReturnCustomers = sumReturnCustomers
            visitData.visits = visits
          }
          return resolve(visitData)



        }
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Find Daily Vistis ')

        return reject(err)
      })

  })
}
const insertManyIntoDashboardChart = (dataArray) => {
  return new Promise((resolve, reject) => {

    DashboardBranchChart.insertMany(dataArray)
      .then(savedData => resolve(savedData))
      .catch(err => {
        return reject(err)
      })
  })
}
const getBranches = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}branch`;
    let config = {
      headers: {
        "Authorization": `Bearer ${merchant.token}`
      }
    };
    axios.get(url, config)
      .then((response) => {
        if (response.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get merchant branches')
        return resolve([])
      });
  })
};

const getBranchIds = async (merchant) => {
  try {
    const response = await getBranches(merchant)
    const list = response.map(branch => {
      return branch.idBranch
    })
    return list
  } catch (err) {
    logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get merchant branches IDs')
    return []
  }
}
const branchBasedVisitsObject = (merchant, branchId, data) => {
  return {
    merchant: merchant._id,
    type: 'dailyVisits',
    chartData: data,
    idBranch: branchId,
    createdAt: new Date()
  }
}
const calculateDailyVisitForBranches = (merchant, response, branchId) => {
  let visitObj = {
    visitDate: new Date(),
  }
  if (!response.length) {
    visitObj.newCustomers = 0
    visitObj.returnCustomers = 0
  }
  else {

    let newCustomers = 0, returnCustomers = 0;
    response.map(element => {
      if (element.visits <= 1) newCustomers++;
      else returnCustomers++

    })

    visitObj.newCustomers = newCustomers
    visitObj.returnCustomers = returnCustomers
  }
  let readyToSave = branchBasedVisitsObject(merchant, branchId, visitObj)
  return readyToSave
}
const calculateBranchVisits = async (merchant, visits) => {
  let branchIds = await getBranchIds(merchant)
  if (!branchIds || !branchIds.length) return `no branches found for merchent ${merchant.idMerchant}`
  else {
    let allBranchesVisit = []
    for (branchId of branchIds) {
      let filteredResponse = visits.filter(visit => visit.idBranch == branchId)
      let visitObj = calculateDailyVisitForBranches(merchant, filteredResponse, branchId)
      allBranchesVisit.push(visitObj)
    }
    let saveBranchesObjects = await insertManyIntoDashboardChart(allBranchesVisit)
    return saveBranchesObjects
  }
}

const dailyVisitsStats = async (merchant) => {


  let response = await getVisits(merchant, 1)
  let visitObj = calculateDailyVisit(merchant, response)
  let saved = await saveDailyVisit(visitObj)
  let branchBasedVisits = await calculateBranchVisits(merchant, response)
  return branchBasedVisits

}

const calculateDailyVisit = (merchant, response) => {
  let visitObj = {
    visitDate: new Date(),
    merchant: merchant._id,
  }
  if (!response.length) {
    visitObj.newCustomers = 0
    visitObj.returnCustomers = 0
  }
  else {

    let newCustomers = 0, returnCustomers = 0;
    response.map(element => {
      if (element.visits <= 1) newCustomers++;
      else returnCustomers++

    })

    visitObj.newCustomers = newCustomers
    visitObj.returnCustomers = returnCustomers
  }

  return { visitObj }
}
// save daily visit to db 
const saveDailyVisit = (data) => {
  return new Promise((resolve, reject) => {
    let newVisit = new DailyVisit(data.visitObj);
    newVisit.save().then((visit) => {
      return resolve(visit)
    })
      .catch((err) => {
        return reject(err)
      })
  })
}

// end of helper functions 

module.exports = {
  dailyVisitsStats,
  findBranchBasedDailyData,
  formatFeedBack,
  getCoupons,
  getGifts,
  calculateDailyVisit,
  findAllDailyData,
  dailyVisitsStats,
  findFromFeedbackStatisticsModel,
  getAllRewardedCustomers,
  getCustomers,
  getNewAndAllCustomers,
  getMerchantBalance,
  updateMerchantInfo,
  getCustomersFeedBack,
  getAverageReturn,
  getAverageDailyVisits,
  getAllPayments,
  getPurchasedCoupons,
  getSentGifts,
  getAverageAge,
  getMalePercentage,
  getFemalePercentage,
  getNoGenderPercentage,
  returnDateString,
  getAllPaymentsRange,
  getAverageReturnRange,
  getAverageAgeRange,
  getMalePercentageRange,
  getFemalePercentageRange,
  getNoGenderPercentageRange,
  getPurchasedCouponsRange,
  calculateVisits,
  getSentGiftsRange,
  returnCachedInsights,
  returnCachedCouponsChart,
  returnCachedGiftsChart,
  returnCachedVisitsPerCustomerChart,
  getAverageReturnBranch,
  getAllPaymentsBranch,
  getMalePercentageBranch,
  getFemalePercentageBranch,
  getNoGenderPercentageBranch,
  getAverageAgeBranch,
  getAverageVisitsBranch,
  calculateVisitsBranch,
  getBranchIds,
  getBranchNames,
  // updateMerchantPoints,
  returnPoints,
  
  getGeneralData
}
