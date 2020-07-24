const {Merchant} = require('../../../db/models/merchant');
const {updateSegmentsData,updateSegmentStats} = require('../../mainBackendServices/segmentsServices');
const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);


const getAllMerchants=()=>{

    return new promise ((resolve,reject)=>{
    
        Merchant.find({})
    
        .then(merchants=>resolve(merchants))
    
        .catch(err=> reject(err) )
    })
}
const updateMerchantSegmentStats=async(merchant)=>{

  await updateSegmentsData(merchant)

   return await updateSegmentStats(merchant)
}

const updateMerchantSegment = (merchants)=>{

return Promise.all(merchants.map(merchant=>{

    return new promise((resolve,reject)=>{

        updateMerchantSegmentStats(merchant)

        .then(updatedStats=>resolve(updatedStats))

        .catch(e=>reject(e))
    })
}));
}


const run = async (data) => {

const allMerchants = await getAllMerchants () 

if(!allMerchants)throw(`no merchants found${jobName}`);

const updatedMerchantsSegments=await updateMerchantSegment(allMerchants)

return updatedMerchantsSegments

}