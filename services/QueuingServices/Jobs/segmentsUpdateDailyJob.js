const {Merchant} = require('../../../db/models/merchant');
const {updateSegmentsData,updateSegmentStats} = require('../../mainBackendServices/segmentsServices');
const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);

const getAllMerchants = () => {

    return new Promise ((resolve,reject) => {

        Merchant.find({})

        .then(merchants => resolve(merchants))

        .catch(error => reject(error))
    });
}

const updateMerchantSegmentsStats = async (merchant) => {
    
    await updateSegmentsData(merchant);

    //console.log("updateSegmentsData")
    
    return await updateSegmentStats(merchant);

}

const updateMerchantsSegments = (merchants) => {
    
    return Promise.all(merchants.map(merchant =>{
        return new Promise((resolve,reject) =>{

            updateMerchantSegmentsStats(merchant)

            .then(updatedStats =>resolve(updatedStats))
    
            .catch(error => reject(error))

        })
       
    }));
}

const run = async (data) => {

    const merchants = await getAllMerchants();

    if(!merchants || !merchants.length) throw `we can't find any merchants ${jobName}`

    const updatedMerchantsSegments = await updateMerchantsSegments(merchants);
    
    return updatedMerchantsSegments;
}

module.exports = run;