const {Gift} = require('../../../db/models/gifts');

const giftServices = require('../../mainBackendServices/giftsServices');

const segmentsServices = require('../../mainBackendServices/segmentsServices');

const {getCurrentJobName} = require('./jobHelpers');

const utilities = require('../../../utilities');

const jobName = getCurrentJobName(__filename);

const customerFilteration = async (gift,customers) =>{
    const birthDayCustomers = customers.filter(customer => {
        return (utilities.date.getDay(customer.customerData.birthday) == utilities.date.getDay());
    });
    let filteredCustomers = await excludeSuperFanCustomers(gift.merchant,birthDayCustomers)
    return filteredCustomers
}

const excludeSuperFanCustomers = async (merchant,customers) =>{
    let superFanGifts = await giftServices.countDocumentsForGifts(merchant)
    let superFanSegment = await segmentsServices.findSegmentBySegmentType(merchant,'superFan')

    if(superFanGifts <= 0) return customers
    else{
        
        let withOutSuperFans = customers.filter(customer => !customer.segments.includes(superFanSegment._id))
        return withOutSuperFans
    }

}

const readyToSendTillParticularDate  = (gift) => {
    return (  
    (utilities.date.getDay(gift.sendDate) == utilities.date.getDay()) ||
    ( new Date(gift.sendDate) < new Date() ) 
    )?
    true:false;
}

const sendThisMonth = async (gift,customers) => {
    
    const birthDayCustomers = customers.filter(customer => {
        return (utilities.date.getMonth(customer.customerData.birthday) == utilities.date.getMonth(gift.sendDate))
        && (utilities.date.getDay(customer.customerData.birthday) == utilities.date.getDay());
    });

    let filteredCustomers = await excludeSuperFanCustomers(gift.merchant,birthDayCustomers)

    return await giftServices.sendAndUpdateGift(gift,filteredCustomers);
}

const sendTillCampaignStop = async (gift,customers) => {

    let filteredCustomers = await customerFilteration(gift,customers)

    return await giftServices.sendAndUpdateGift(gift,filteredCustomers);
}

const sendTillParticularDate = async (gift,customers) => {

    let filteredCustomers = await customerFilteration(gift,customers)

    return await giftServices.sendAndUpdateGift(gift,filteredCustomers);
   
}
const sendSuperFanGift = async (gift) =>{
    let customers =  await segmentsServices.getCustomersInMultiSegments(gift.merchant,gift.segment._id)

    const birthDayCustomers = customers.filter(customer => {
        return (utilities.date.getDay(customer.customerData.birthday) == utilities.date.getDay());
    });

    return await giftServices.sendAndUpdateGift(gift,birthDayCustomers);


}
const readyToStopThisMonth = (giftSendDate) =>{
    return parseInt(utilities.date.getMonth(giftSendDate)) < parseInt(utilities.date.getMonth())
}

const readyToStopTillParticularDate = (gift) =>{
    return new Date(gift.expirationDate) < new Date();
}



const filterBirthdayByGiftSegmentAndSend = async(gift,customers) => {

    if(gift.giftSegmentId == 'send_this_month' && gift.sendDate){
        if(readyToStopThisMonth(gift.sendDate))
            return await giftServices.justUnpublishGift(gift._id);
        return await sendThisMonth(gift,customers);
    }else if(gift.giftSegmentId == 'send_till_campaign_stop' ){
        return await sendTillCampaignStop(gift,customers);
    }else if(gift.giftSegmentId == 'superfan_birthday_gift' ){
        return await sendSuperFanGift(gift);
    }else if(gift.giftSegmentId == 'send_till_particular_date' && gift.sendDate){
         if(readyToStopTillParticularDate(gift))
             return await giftServices.justUnpublishGift(gift._id);
         else if(readyToSendTillParticularDate(gift)) 
             return await sendTillParticularDate(gift,customers);
         else return `this gift ${gift._id} is not actived yet `  
    }

    return Promise.reject(`not vaild birthday Type or missing sendDate ${gift._id}`);
   
}


const run = async (data) => {
    
    if(!data.giftId) throw `no gift Id`;
   
    const gift = await giftServices.findById(data.giftId);

    const customers = await segmentsServices.getSegmentCustomers(gift.merchant,[gift.segment._id]);

    if(!customers && !customers.length) return 'no customers';

    return await filterBirthdayByGiftSegmentAndSend(gift,customers);
   
}

module.exports = run;