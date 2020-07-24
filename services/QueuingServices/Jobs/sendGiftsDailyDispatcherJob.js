const {Gift} = require('../../../db/models/gifts');

const giftServices = require('../../mainBackendServices/giftsServices');

const {getCurrentJobName} = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);

const getGiftsDependOnTime = () => {
    return [
        'send_on_particular_date',
        'send_this_month',
        'send_till_campaign_stop',
        'send_till_particular_date'
    ];

}

const getActiveGifts = () => {

    return new Promise((resolve,reject) => {

        Gift.find({status:'active',giftSegmentId:{$in:getGiftsDependOnTime()}})
        
        .populate([{
            path: 'merchant',
            model: 'Merchant'
        }, {
            path: 'segment',
            model: 'Segments'
        }])
        
        .exec()

        .then(gifts => resolve(gifts))

        .catch(error => reject(error));
    });
}

const run = async (data) => {

    const gifts = await getActiveGifts();

    if(!gifts.length) return 'no active gifts';

    gifts.forEach((gift) => {
        giftServices.filterSegmantsToDispatchSystemJobs(gift);
    })

    return true;

}

module.exports = run;