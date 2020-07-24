const bodyParser = require('body-parser');
const express = require('express');
const { generalResponse } = require('../requests/helpers/responseBody');
const couponServices = require('../services/mainBackendServices/couponServices');
const dashboardServices = require('../services/mainBackendServices/dashboardServices')
const loyaltyPorgram = require('../services/mainBackendServices/loyaltyProgramsServices')
const giftsServices = require('../services/mainBackendServices/giftsServices')
const customerServices = require('../services/mainBackendServices/customersServices')
const { DashboardChart } = require('../db/models/DashboardCharts');
let app = express();
app.use(bodyParser.json());

exports.getGeneral = (req, res) => {
  dashboardServices.getGeneralData(req)
    .then((reslut) => {
      return res.send(generalResponse(reslut, [], "Data Found Successfully"));

    })
    .catch((err) => res.status(400).send(generalResponse({}, [], "Error getting Dashboard Insights")))
}

exports.returnBranchIds = (req, res) => {
  dashboardServices.getBranchNames(req.merchant)
    .then(response => {
      res.send(generalResponse({ "branches": response }, [], 'Dashboard Branches'))
    })
    .catch(err => {
      res.status(400).send(generalResponse({}, err.errors, "Error getting Dashboard branches"));
    })
}

exports.getDashboardInsights = (req, res) => {
  dashboardServices.returnCachedInsights({ merchant: req.merchant, idBranch: req.query.idBranch })
    .then(response => {
      res.send(generalResponse({ "Insights": response }, [], 'Dashboard Branch Insights'));
    })
    .catch((err) => {
      res.status(400).send(generalResponse({}, err.errors, "Error getting Dashboard Branch Insights"));
    })
}


exports.getDashboardInsightsRange = (req, res) => {
  // let days = req.query.days;
  let startDate = req.query.startdate
  let endDate = req.query.enddate
  Promise.all([
    // dashboardServices.getAllPaymentsRange(req, startDate, endDate),
    dashboardServices.getAverageReturnRange(req.merchant, startDate, endDate),
    dashboardServices.getPurchasedCouponsRange(req.merchant, startDate, endDate),
    dashboardServices.getSentGiftsRange(req.merchant, startDate, endDate),
    dashboardServices.getAverageAgeRange(req.merchant, startDate, endDate),
    dashboardServices.getMalePercentageRange(req.merchant, startDate, endDate),
    dashboardServices.getFemalePercentageRange(req.merchant, startDate, endDate),
    dashboardServices.getNoGenderPercentageRange(req.merchant, startDate, endDate)
  ])
    .then((response) => {
      res.send(generalResponse({ "Insights": response }, [], 'Dashboard Insights'));
    })
    .catch((err) => {
      res.status(400).send(generalResponse({}, err.errors, "Error getting Dashboard Insights"));
    })
};

// Charts

// Visits per customer chart
exports.visitsPerCustomerChart = (req, res) => {
  dashboardServices.returnCachedVisitsPerCustomerChart({ merchant: req.merchant, idBranch: req.query.idBranch })
    .then(response => {
      res.send(generalResponse(response, [], 'Visits Per Customer Chart'));
    })
    .catch((err) => {
      res.send(generalResponse({}, err.errors, 'Chart loading failed and returned empty array'));
    })
};

exports.couponChart = (req, res) => {
  dashboardServices.returnCachedCouponsChart(req.merchant)
    .then(response => {
      res.send(generalResponse(response, [], 'Coupon Chart'));
    })
    .catch(err => {
      res.status(400).send(generalResponse({}, err.errors, "Error in Coupon Chart"));
    })
};

exports.giftChart = (req, res) => {
  dashboardServices.returnCachedGiftsChart(req.merchant)
    .then(response => {
      res.send(generalResponse(response, [], 'Gift Chart'));
    })
    .catch(err => {
      res.status(400).send(generalResponse({}, err.errors, "Error in Gift Chart "));
    })
};

// feedback statistics
exports.feedbackStats = (req, res) => {
  let merchant = req.merchant

  dashboardServices.findFromFeedbackStatisticsModel(merchant)

    .then((data) => {
      let msg = !data.length ? 'no feedback found yet ' : 'feedback found successfully'
      res.send(dashboardServices.formatFeedBack(data, [], msg))
    })

    .catch((err) => {
      return res.status(400).send(generalResponse({}, [], "can't find feedback data"));
    })



}

// customers daily visits
const branchBasedOrNot  = async (req) =>{
  let currentDate = new Date();

  if(req.query.idBranch)
  return await  dashboardServices.findBranchBasedDailyData(req)
  else if(!req.query.idBranch)
  return await dashboardServices.findAllDailyData(req, currentDate)
  else return Promise.reject('cant find any data')

}
exports.newVsReturn = (req, res) => {

  branchBasedOrNot(req)

    .then((response) => {

      let msg = !response.visits.length ? "there isn't new or return customers yet " : "customers daily visits Insights";

      res.send(generalResponse(response, [], msg))

    })
    .catch((err) => {

      return res.status(400).send(generalResponse({}, [], "can't find customers visits"));
    })

}
// exports.newVsReturnBranch = (req, res) => {

//   dashboardServices.findBranchBasedDailyData(req)

//     .then((response) => {

//       let msg = !response.visits.length ? "there isn't new or return customers yet " : "customers daily visits Insights";

//       res.send(generalResponse(response, [], msg))

//     })
//     .catch((err) => {

//       return res.status(400).send(generalResponse({}, [], "can't find customers visits"));
//     })
// }

