const customerServices = require('../../mainBackendServices/customersServices')
const {Merchant} = require('../../../db/models/merchant');

const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);
const getAllMerchants = () => {

    return new Promise ((resolve,reject) => {

        Merchant.find({})

        .then(merchants => resolve(merchants))

        .catch(error => reject(error))
    });
}

const saveCustomersFeedback = async (merchant)=>
{

   await customerServices.getAndSaveFeedback(merchant)
   return await customerServices.feedbackStatistics(merchant)
   
}

const saveCustomersFeedbackToMerchants =  (merchants)=>{
    return Promise.all(merchants.map(merchant =>{

        return new Promise((resolve,reject) =>{

            saveCustomersFeedback(merchant)
            .then(response =>resolve(response))
            .catch(error => reject(error))

        })
       
    })
    );
      
    
}


const run = async (data) => {
   
    let merchants = await getAllMerchants()
    console.log('start',merchants)
    if(!merchants.length) throw `we can't find any merchants ${jobName}`

    return await  saveCustomersFeedbackToMerchants(merchants)
  
}

module.exports = run; 