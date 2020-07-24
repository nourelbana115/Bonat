const {Gift} = require('../../../db/models/gifts');

const giftServices = require('../../mainBackendServices/giftsServices');

const segmentsServices = require('../../mainBackendServices/segmentsServices');

const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);


const run = async (data) => {

    if(!data.giftId) throw `no gift Id`;
  
    const gift = await giftServices.findById(data.giftId);
    
    if(!(gift.giftSegmentId == 'send_till_campaign_stop'))throw `wrong giftSegmentId or missing sendDate ${gift._id}`;

    const customers = await segmentsServices.getSegmentCustomers(gift.merchant,[gift.segment._id]);
    
    if(!customers && !customers.length) return 'no customers';
    
    return await giftServices.sendAndUpdateGift(gift,customers);
   
}

module.exports = run;