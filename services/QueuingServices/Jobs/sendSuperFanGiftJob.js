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

const run = async (data) => {
    console.log('run from super fans ')

    const giftId = data.giftId;
    const segmentId = data.segmentId

    if(!giftId) throw `we can't find this gift Id ${jobName}`

    if(!segmentId) throw `we can't find this segment Id ${jobName}`

    const gift = await getGift(giftId);

    if(!gift || !gift.merchant) throw `we can't find this gift or gift with Id ${giftId} ${jobName}`

    if(gift.status !== 'active' && !gift.idCampaign) throw  `this gift is not active ${giftId} at ${jobName}`

    let giftIdCampaign = gift.idCampaign;
    let merchant = gift.merchant;
    
    let { receivingCustomers ,receivingCustomersForDb} = await giftServices.getSegmentCustomers(merchant,segmentId)

    let sentGift = await giftServices.sendGiftToCustomers(giftIdCampaign,gift,receivingCustomers)

    //if(sentGift.code === 1) throw `gift not sent due to ${sentGift.errors}`
    
    return await giftServices.unpublishGift(giftId,receivingCustomersForDb)
    
}

module.exports = run;