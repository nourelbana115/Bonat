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


const getNewAndAllCustomers=(req)=>{
   let merchant=req.merchant
    return new Promise((resolve,reject)=>{

        bonatCustomers={
            type:"bonatCustomers",
            label:"current and new customers",
            items:[{
                label:"number of customers",
                value:0
            },
            {
                label:"number of new customers",
                value:0
            }
        ]
    }
    let segments=['everyone']
    segmentServices.getSpecificSegments(merchant,segments)
    .then((response) => {
        if (!response.length) resolve(bonatCustomer)
        else{
            let segmentData=response[0].segmentData
            bonatCustomer.items[0].value=segmentData.allCustomers.value
            bonatCustomer.items[1].value=segmentData.registeredThisMonth.value
            return resolve(bonatCustomer) 
        }
        
      })
      .catch((err)=>reject (err))

    }
    
    )
    
}




exports.generalData=(req)=>{
let merchantData = req.merchant;
let final={}
return new Promise((resolve,reject=>{
Promise.all([
    getNewAndAllCustomers(req),
    loyaltyPorgram.getLoyaltyPorgramDate(merchantData),
    customerServices.getTotalCommentsAndRate(merchantData),
    returnPoints(merchantData),
    getMerchantBalance(req)

])
.then(result=>{
  let[bonatCustomers, activeSince, feedback, merchantPoints, balance]=result
  final =
  {
    "quickActions": [bonatCustomers, feedback, merchantPoints, activeSince],
    "customerBalance": balance
  }
  return resolve(final)

})
.catch((error) => reject (error))

}))
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


 const getMerchantBalance=(req)=>{
    
     return new Promise((resolve,reject=>{
        findFromMerchantModel({_id:req.merchant._id})
        .then((response=>{
            let balance =!response.balance ? null: response.balance
            return resolve (balance)
        }
        ))
     }))
 }
 const findFromMerchantModel=(query)=>{
     return new Promise((resolve,reject=>{
          Merchant.find(query)
     .then(response => resolve(response))
     .catch((error=>{
        logger.log('requests', 'error', `${error} for merchant: ${merchant.idMerchant}`, 'Get Merchant Data')
        return error
     }))
     }))
    
 }