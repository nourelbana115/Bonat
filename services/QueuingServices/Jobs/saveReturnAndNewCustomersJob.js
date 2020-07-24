const dashboardServices = require('../../mainBackendServices/dashboardServices')
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

const calculateDailyVisitStats = async (merchant)=>
{
  
  return await dashboardServices.dailyVisitsStats(merchant)
   
}

const addDailyVisitToMerchants =  (merchants)=>{
    return Promise.all(merchants.map(merchant =>{

        return new Promise((resolve,reject) =>{

            calculateDailyVisitStats(merchant)
            .then(response =>resolve(response))
            .catch(error => reject(error))

        })
       
    })
    );
      
    
}


const run = async (data) => {
  
    let merchants = await getAllMerchants()

    if(!merchants.length) throw `we can't find any merchants ${jobName}`

    return await  addDailyVisitToMerchants(merchants)

  
}

module.exports = run; 