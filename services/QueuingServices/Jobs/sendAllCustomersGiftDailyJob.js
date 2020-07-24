const {Gift} = require('../../../db/models/gifts');

const giftServices = require('../../mainBackendServices/giftsServices');

const segmentsServices = require('../../mainBackendServices/segmentsServices');

const {getCurrentJobName} = require('./jobHelpers');

const utilities = require('../../../utilities');

const jobName = getCurrentJobName(__filename);



const checkOnStartDate  = (gift) => {
    return (  
    (utilities.date.getDay(gift.sendDate) == utilities.date.getDay()) ||
    ( new Date(gift.sendDate) < new Date() ) 
    )?
    true:false;
}
const checkOnExpirationDate  = (gift) => {
    return new Date(gift.expirationDate) <= new Date();
}


const sendGiftOrStopIt = async(gift,customers) => {

    if(checkOnExpirationDate(gift)) return await giftServices.justUnpublishGift(gift._id);

    else if(checkOnStartDate(gift)) return await giftServices.sendAndUpdateGift(gift,customers);

    else return `this gift ${gift._id} is not actived yet `
}

const run = async (data) => {
    if(!data.giftId) throw `no gift Id`;
   
    const gift = await giftServices.findById(data.giftId);
    
    const customers = await segmentsServices.getSegmentCustomers(gift.merchant,[gift.segment._id]);

    if(!customers || !customers.length) return 'no customers';

    return await sendGiftOrStopIt(gift,customers);
   
}

module.exports = run;