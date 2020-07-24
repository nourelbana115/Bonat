
const {Merchant} = require('../models/merchant');
const logger = require('../../services/logger');
const segmentServices = require('../../services/mainBackendServices/segmentsServices');


const getAllMerchants  = () => {
    return new Promise((resolve,reject) =>{
        Merchant.find({})
        .then(merchants => resolve(merchants))
        .catch(error => reject(error))
    });
}

const addDefaultToMerchant = async(merchantId) => {
    
    let segments = await segmentServices.findIfDefaultSegmetsExist(merchantId);

    if(!segments.length)  segments = await segmentServices.addingDefaultSegments(merchantId);
    
    if(!segments.length)  return Promise.reject(`can't create segments for merchant ${merchantId}`);

    return true;
        
}


const run = async (data) => {
    
    const merchants = await getAllMerchants();

    if(!merchants || !merchants.length ) throw 'no merchants to add defauls segmnents';
    
    return Promise.all(merchants.map(merchant => {
        return new Promise((resolve,reject) => {
            addDefaultToMerchant(merchant._id) 
            .then(segments => resolve(segments))
            .catch(error =>{
                logger.log('general','error',error,"merchant Segments Seeder");
                reject(error);
            })
        })
    }));

}


module.exports = run;