const {Gift} = require('../../../db/models/gifts');

const giftServices = require('../../mainBackendServices/giftsServices');

const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);


const getGift = (giftId) => { 

   return new Promise((resolve,reject) =>{

        Gift.findOne({ _id: giftId })

        .populate('merchant')

        .exec()

        .then(gift => resolve(gift))

        .catch(error => reject(error))

   });

};

const addGiftInBackend = async(gift) =>{
    
    const giftData = {
        title: gift.title,
        title_ar: gift.title_ar,
        description: gift.description,
        description_ar: gift.description_ar,
        numOfValidDays: gift.numOfValidDays,
        imageUrl: gift.imageUrl,
        idCampaignType:gift.idCampaignType,
        discount: gift.discount,
        dashboardData: JSON.stringify(gift.dashboardData)
    };


    return await giftServices.createGift(giftData,gift.merchant);
}

const updateGiftWithIdCampaign = async(giftId,idCampaign) => {

    return await giftServices.updateGiftDoc(
        {_id:giftId},
        {
            $set:{
                idCampaign:idCampaign,
                status:'active',
                updatedAt: new Date()
            }
        }
    );
}

const run = async (data) => {
    
    const giftId = data.giftId;
    
    if(!giftId) throw `we can't find this gift Id ${jobName}`

    const gift = await getGift(giftId);

    if(!gift || !gift.merchant) throw `we can't find this gift or gift with Id ${giftId} ${jobName}`

    const backendGiftData = await addGiftInBackend(gift);

    if(!backendGiftData.idCampaign) throw `we can't send backend gift with Id ${giftId} ${jobName}`

    let giftWithIdCampaign = await updateGiftWithIdCampaign(giftId,backendGiftData.idCampaign);

    return giftWithIdCampaign

}

module.exports = run;