const giftServices = require('../../mainBackendServices/giftsServices');
const {Gift} = require('../../../db/models/gifts');
const {getCurrentJobName} = require('./jobHelpers');
const jobName = getCurrentJobName(__filename);

const getAllGifts = () => {
    let allowedStatus = ['active','history']
    return new Promise ((resolve,reject) => {

        Gift.find({status:{$in:allowedStatus}})
        .populate('merchant','token')
        .then(gifts => resolve(gifts))

        .catch(error => reject(error))
    });
}

const calculateGiftStatistics= (gifts)=>{
    return Promise.all(gifts.map(gift =>{
        return new Promise((resolve,reject) =>{

            giftServices.saveGiftStatistics(gift)

            .then(updatedStats =>resolve(updatedStats))
    
            .catch(error => reject(error))

        })
       
    }));
}

const run = async (data) => {

    const gifts = await getAllGifts();

    if(!gifts || !gifts.length) throw `we can't find any gifts ${jobName}`

    return await calculateGiftStatistics(gifts);
     
}

module.exports = run;