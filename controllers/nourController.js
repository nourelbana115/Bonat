const bodyParser = require('body-parser');
const express = require('express');
const { generalResponse } = require('../requests/helpers/responseBody');
const couponServices = require('../services/mainBackendServices/couponServices');
const dashboardServices = require('../services/mainBackendServices/nourServices')
const loyaltyPorgram = require('../services/mainBackendServices/loyaltyProgramsServices')
const giftsServices = require('../services/mainBackendServices/giftsServices')
const customerServices = require('../services/mainBackendServices/customersServices')
const { DashboardChart } = require('../db/models/DashboardCharts');
let app = express();
app.use(bodyParser.json());

exports.getGeneral=(req,res)=>{
    dashboardServices.generalData(req)
    .then(result=>{
        return res.send(generalResponse(result,[],"data found successfully"))
    })
    .catch((err) => res.status(400).send(generalResponse({}, [], "Error getting Dashboard Insights")))

}