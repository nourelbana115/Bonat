
const _ = require('lodash');
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');


let app = express();
app.use(bodyParser.json());

let { Gift } = require('../../db/models/gifts');
let { GiftStatistics } = require('../../db/models/giftStatistics');
const logger = require('../logger');
const queue = require('../QueuingServices/queue');
const segmentServices = require('./segmentsServices')
const utilities = require('../../utilities');




// send gift to customers data = {idCampaign: 1003, customers: [10, 11, 12]}
const sendGift = (merchant, data) => {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}sendCoupon`
        let config = {
            headers: {
                "Authorization": "Bearer " + merchant.token
            }
        }
        axios.post(url, data, config)
            .then((response) => {
                //console.log(response)
                if (response.code == 1) {
                    reject(response.errors)
                }
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Send Gift')
                return reject(err)
            });
    })

}

const giftProcess = (req, data, giftData) => {
    return new Promise((resolve, reject) => {
        sendGift(req, data).then((response) => {
            if (response.code == 1) {
                reject(response.errors)
            }
            giftData.giftCustomers = data.cusotmers;
            //save gift
            let newGift = new Gift(giftData);
            newGift.save().then((newGift) => {
                return resolve({ ...newGift._doc });
            }).catch((e) => {
                reject(e);
            });
        }).catch((error) => {
            reject(error.errors)
        })

    })
}

// create gift in Backend side.
const createGift = (giftData,merchant)=> {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}reward`
        let config = {
            headers: {
                "Authorization": "Bearer " + merchant.token 
            }
        }
        axios.post(url, giftData, config)
            .then((response) => {
                if(response.code == 1) return reject(response.data);
                console.log(response.data.data)
                return resolve(response.data.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Create Gift')
                return reject(err)
            });
    })

}

const updateGiftDoc = (query,updateObj) => {

    return new Promise((resolve,reject) => {

        Gift.findOneAndUpdate(query,updateObj,{new:true, useFindAndModify: false})

        .exec()
    
        .then((gift) => resolve(gift))
        
        .catch(error => reject(error));
    })

}

const updateGiftStatisticsDoc = (query,updateObj) => {
    return new Promise((resolve,reject) => {

        GiftStatistics.findOneAndUpdate(query,updateObj,{upsert:true, useFindAndModify: false})
    
        .then((updated) => resolve(updated))
        
        .catch(error => {
            logger.log('requests', 'error', err, 'Saving Percentage to Database')
            return reject(error)
        });
    })
}
const updateGiftStatistics =  (giftId,data) =>{
        return new Promise((resolve, reject) => {
                updateGiftStatisticsDoc({gift:giftId},
                {
                    $set:{
                        gift:giftId,
                        amountOfSentGifts: data.amountOfSentGifts,
                        amountOfUsedGifts: data.amountOfUsedGifts,
                        percentageOfUsage: data.percentageOfUse,
                        createdAt:new Date()
                    }
                })
                .then(updatedStats =>{
                    return resolve(updatedStats)})
    
                .catch(error => reject(error))
        })
}

const saveGiftStatistics = async (gift) => {

    let giftIdCampaign = gift.idCampaign
    let giftId = gift._id
    let merchant = gift.merchant;
    let giftStatistics = await getGiftStat(giftIdCampaign,merchant)
    if(!giftStatistics) return `no gift statistics for ${giftId}`
     let updated = await updateGiftStatistics(giftId,giftStatistics)
    return updated

}

// call get stats for gift
const getAllGiftStat = (merchant)=> {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}giftStats`
        let config = {
            headers: {
                "Authorization": `Bearer ${merchant.token}`
            }
        }
        axios.get(url, config)
            .then((response) => {
                //logger.log('requests', 'info', response.data, 'Get Gift Stats')
                if (response.code == 1) return resolve([])
                return resolve(response.data.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Get Gift Stats')
                return resolve([])
            });
    })
}
const getGiftStat = (idCampaign,merchant)=> {
    return new Promise((resolve, reject) => {

        let url = `${process.env.MAIN_BACKEND_API}giftStats?filter=${idCampaign}`
        let config = {
            headers: {
                "Authorization": `Bearer ${merchant.token}`
            }
        }
        axios.get(url, config)
            .then((response) => {
                if (response.code == 1) return reject(response)
                //logger.log('requests', 'info', response.data, 'Get Gift Stats')
                response = response.data.data[0]

                return resolve(response)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Get Gift Stats')

                return reject(err)
            });
    })
}
const findFromGiftModel  = (query) =>{
  return new Promise((resolve,reject)=> {
        Gift.find(query)
        .then((found) =>{return resolve(found)})
        .catch((err) => {
        logger.log('requests', 'error', err, 'Finding Data From Gift Model')
        return reject(err) 
        })
    })
}
const findFromGiftStatisticsModels = (query) =>{
   return new Promise((resolve,reject)=>{
    GiftStatistics.findOne(query)
    .then(found => resolve(found))
    .catch(err =>{
        logger.log('requests', 'error', err, 'Finding Data From GiftStatistics Model')
        reject(err)
    })
 })
}
const findFromGiftStatisticsWithMerchant = (query) =>{
    return new Promise((resolve,reject)=>{
     GiftStatistics.find(query)
     .populate('gift','merchant')
     .then(found => resolve(found))
     .catch(err =>{
         logger.log('requests', 'error', err, 'Finding Data From GiftStatistics Model')
         reject(err)
     })
  })
 }
const getGifts = (req) =>{
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}reward`
        let config = {
            headers: {
                "Authorization": "Bearer " + req.header('outSideToken')
            }
        }
        axios.get(url, config)
            .then((response) => {
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Get Gifts')
                return reject(err)
            });
    })
}

// // need to be modified :)
// const getMerchantCustomers = (req, merchantData) =>{
//     return new Promise((resolve, reject) => {
//         let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers`
//         let config = {
//             headers: {
//                 "Authorization": "Bearer " + req.header('outSideToken')
//             }
//         }
//         axios.get(url, config)
//             .then((response) => {
//                 return resolve(response.data)
//             })
//             .catch((err) => {
//                 logger.log('requests', 'error', err, 'Get Merchant Customers')
//                 return reject(err)
//             });
//     })
// }

// save gift in DB
const saveGift = (giftData)=> {
    return new Promise((resolve, reject) => {
        let newGift = new Gift(giftData);
        newGift.save().then((newGift) => {
            return resolve({ ...newGift._doc });
        }).catch((e) => {
            logger.log('requests', 'error', e, 'Saving Gift To Db')
            return reject(e)
        });
    })
}
const dispatchSuperFansJobs = (segmentId,giftId) =>{
    queue.publisher.dispatch([
        {
            jobfile:"publishGiftOnBackendJob",
            data:{giftId:giftId}
        },
        {
            jobfile:'sendSuperFanGiftJob',
            data:{
                giftId:giftId ,
                segmentId:segmentId
                } 
        }
    ])
}
const dispatchEveryOneJobs = (segmentId,giftId) =>{
    queue.publisher.dispatch([
        {
            jobfile:"publishGiftOnBackendJob",
            data:{giftId:giftId}
        },
        {
            jobfile:'sendAllCustomersGiftJob',
            data:{
                giftId:giftId,
                segmentId:segmentId
                } 
        }
     ]);
}
const dispatchLostCustomersJobs= (segmentId,giftId)=>{
    queue.publisher.dispatch([
        {
            jobfile:"publishGiftOnBackendJob",
            data:{giftId:giftId}
        },
        {
            jobfile:'sendLostCustomersGiftJob',
            data:{
                giftId:giftId,
                segmentId:segmentId          
                } 
        }
    ]);
}
const dispatchNewCustomersJobs = (segmentId,giftId) =>{
    queue.publisher.dispatch([
        {
            jobfile:"publishGiftOnBackendJob",
            data:{giftId:giftId}
        },
        {
            jobfile:'sendNewCustomersGiftJob',
            data:{
                giftId:giftId,
                segmentId:segmentId
            } 
        }
    ]);
}
const publishGiftOnBackendJob = (giftId) =>{
    queue.publisher.dispatch([
        {
            jobfile:"publishGiftOnBackendJob",
            data:{giftId:giftId}
        }
    ]);
}
const dispatchCustomSegmentJob = (segmentId,giftId) =>{
    queue.publisher.dispatch([
        {
            jobfile:'publishGiftOnBackendJob',
            data:{
              giftId:giftId,
            } 
        },
        {
            jobfile:"sendToCustomSegmentGiftJob",
            data:{
                giftId:giftId,
                segmentId:segmentId
            }
          }
        ])
}
const filterSegmantsToDispatchJobs =  (name,gift) =>{
    

          let sendId = gift.giftSegmentId
          let segmentId = gift.segment
          let giftId = gift._id

          if(name === 'superFan') dispatchSuperFansJobs(segmentId,giftId)

          else if(name === 'everyone' && sendId === 'send_after_publishing') dispatchEveryOneJobs(segmentId,giftId)

          else if(name === 'lostCustomers' && sendId === 'send_once') dispatchLostCustomersJobs(segmentId,giftId)

          else if(name === 'newCustomers' && sendId === 'send_once') dispatchNewCustomersJobs(segmentId,giftId) 

          else publishGiftOnBackendJob(giftId)

      
}
// const checkToDispatchForEveryOneOnDate  = (gift) => {
//     return (gift.segment.segmentType == 'everyone' && 
//     gift.giftSegmentId == 'send_on_particular_date' &&
//     gift.sendDate &&  
//     (utilities.date.getDay(gift.sendDate) == utilities.date.getDay()))?
//     true:false;
// }
// const dispatchAllCustomrsGiftOnDate = (gift) => {
//     queue.publisher.dispatch(
       
//         {
//             jobfile:'sendAllCustomersGiftJob',
//             data:{
//                 giftId:gift._id,
//                 segmentId:gift.segment
//             } 
//         }
//     );
// }
const dispatchAllCustomrsGiftOnDate = (gift) => {
    queue.publisher.dispatch(
       
        {
            jobfile:'sendAllCustomersGiftDailyJob',
            data:{
                giftId:gift._id,
            } 
        }
    );
}

const dispatchBirthdayDailyJob = (gift) => {
    queue.publisher.dispatch(
       
        {
            jobfile:'sendBirthdayDailyGiftJob',
            data:{
                giftId:gift._id
            } 
        }
    );
}

const dispatchLostCustomersDailyJob = (gift) => {
    queue.publisher.dispatch(
       
        {
            jobfile:'sendLostAndNewCustomersDailyGiftJob',
            data:{
                giftId:gift._id
            } 
        }
    );
}

const dispatchNewCustomersDailyJob = (gift) => {
    queue.publisher.dispatch(
       
        {
            jobfile:'sendLostAndNewCustomersDailyGiftJob',
            data:{
                giftId:gift._id
            } 
        }
    );
}
// const dispatchSuperFansBirthdayGiftJob= (gift) => {
//     queue.publisher.dispatch(
       
//         {
//             jobfile:'sendSuperFansBirthdayGiftJob',
//             data:{
//                 giftId:gift._id
//             } 
//         }
//     );
// };


const filterSegmantsToDispatchSystemJobs = (gift) =>{
    
    if(gift.segment.segmentType == 'everyone'){
        dispatchAllCustomrsGiftOnDate(gift)
    }else if(gift.segment.segmentType == 'birthday'){
        dispatchBirthdayDailyJob(gift);
    }else if(gift.segment.segmentType == 'lostCustomers' &&
        gift.giftSegmentId == 'send_till_campaign_stop'){
        dispatchLostCustomersDailyJob(gift);
    }else if (gift.segment.segmentType == 'newCustomers' &&
        gift.giftSegmentId == 'send_till_campaign_stop'){
        dispatchNewCustomersDailyJob(gift);
    }
}
const countDocumentsForGifts = (merchant)  =>{
    return new Promise((resolve,reject) => {
        Gift.countDocuments(
            {merchant:merchant._id,
            status:'active',
            giftSegmentId:'superfan_birthday_gift'})
        .then((amount) => resolve(amount))
        .catch(err =>{
            logger.log('requests', 'error', err, 'Finding Count From Gift Model')

            return reject(err)
        })

    })

}
const findById = (giftId) => {

    return new Promise((resolve,reject) => {

       Gift.findOne({_id:giftId})

        .populate([{
            path: 'merchant',
            model: 'Merchant'
        }, {
            path: 'segment',
            model: 'Segments'
        }])

       .exec()

       .then(gift => resolve(gift))

       .catch(error => reject(error));

    });
}
// const dispatchSendNowJobs = (jobName,giftId,segmentId) =>
// {
//     queue.publisher.dispatch([
//         {
//             jobfile:"publishGiftOnBackendJob",
//             data:{giftId:giftId}
//         },
//         {
//             jobfile:jobName,
//             data:{
//                 giftId:giftId ,
//                 segmentId:segmentId
//                 } 
//         }
//     ])
  
// }

const createCustomSegmentGift = async (merchant,customers,giftData) =>{
    try{
    let newSegment = await segmentServices.createCustomSegment(merchant,customers)
    giftData.segment = newSegment._id
    let savedGift =  await saveGift(giftData)
    let giftId = savedGift._id
    let segmentId = newSegment._id

    if( savedGift.status !== 'draft' ) dispatchCustomSegmentJob(segmentId,giftId)
    return savedGift
    }
    catch (err) {
        return err
    }
}
const findFromGiftModelWithSegment= (query) =>{
    return new Promise((resolve,reject)=> {
        Gift.findOne(query)
        .populate('segment','segmentType')
        .then((found) =>resolve(found))
        .catch((err) => {
        logger.log('requests', 'error', err, 'Finding Data From Gift Model')
        return reject(err) 
        })
    })
}

const sendGiftToCustomers = async (idCampaign,gift,customers) =>{
    let merchant = gift.merchant
    let data ={
        idCampaign:idCampaign,
        cusotmers:customers //this not a typo bonat server accepts cusotmers not customers
    }
    return await sendGift(merchant,data)
}

const justUnpublishGift = async (giftId) =>{

    return await updateGiftDoc(
        {_id:giftId},
        {
            $set:{
                status:'history',
                updatedAt: new Date()
            }
        }
    );
}

const customersBackendIds = (customers) => {
    return customers.map(({idCustomer}) => idCustomer);
 }
 
 const sendAndUpdateGift = async (gift,giftCustomers) =>{
    
     if(!giftCustomers.length) return 'no gift customers';
       
     let customersDidNotRecivedGift = giftCustomers;
     
     if(gift.receivedCustomers.length){
         customersDidNotRecivedGift = giftCustomers.filter(customer => {
             return gift.receivedCustomers.includes(customer._id) === false;
         })
     }
 
     if(!customersDidNotRecivedGift.length) return 'no customers did not receive this gift';
 
     await sendGiftToCustomers(
         gift.idCampaign,gift,customersBackendIds(customersDidNotRecivedGift));
 
 
     const customersRefs = customersDidNotRecivedGift.map(({_id})=>_id);
 
     return await updateGiftDoc(
         {_id:gift._id},
         {
             $push:{
                receivedCustomers:{
                    $each:customersRefs
                }
             },
             $set:{
                updatedAt: new Date()
             }
         }
     );
 
 }

 const getSegmentCustomers = async(merchant,segmentId) =>{
    let segmentIds = [segmentId]

    let customers = await segmentServices.getSegmentCustomers(merchant,segmentIds)

    let receivingCustomers = customers.map((element)=>element.idCustomer) // for bonat backend to send with it

    let receivingCustomersForDb =  customers.map((element)=>element._id) // for our database to save 

    return {receivingCustomers,receivingCustomersForDb}
}

const unpublishGift = async (giftId,customers) =>{

    return await updateGiftDoc(
        {_id:giftId},
        {
            $set:{
                status:'history',
                receivedCustomers:customers,
                updatedAt: new Date()

            }
        }
    );
}

const getAllGifts = (merchant) => {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}reward`
        let config = {
            headers: {
                "Authorization": "Bearer " + merchant.token
            }
        }
        axios.get(url, config)
            .then((response) => {
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Get Gifts')
                return reject(err)
            });
    })
}

const saveOldGift = async (giftData) => {
    const newGift = new Gift(giftData)
    newGift.save()
}

const saveHistoricalGifts = async (merchant) => {
    const response = await getAllGifts(merchant)
    const responseData = response.data
    for (gift of responseData) {
        const giftData = {
            merchant: merchant._id,
            idCampaign: gift.idCampaign,
            title: gift.title,
            title_ar: "هدية",
            description: gift.description,
            description_ar: "هدية",
            numOfValidDays: gift.numOfValidDays,
            imageUrl: gift.imageUrl,
            receivedCustomers: [],
            dashboardData: gift.dashboardData,
            status: "draft",
            idCampaignType: gift.idCampaignType,
            createdAt: gift.createdAt,
            latestUpdate: new Date(),
        }
        await saveGift(giftData)
    }
}

module.exports={
    sendGift,
    giftProcess,
    createGift,
    getGifts,
    // getMerchantCustomers,
    saveGift,
    getGiftStat,
    updateGiftDoc,
    saveGiftStatistics,
    getGifts,
    filterSegmantsToDispatchJobs,
    createCustomSegmentGift,
    dispatchCustomSegmentJob,
    findFromGiftModel,
    findFromGiftStatisticsModels,
    findFromGiftModelWithSegment,
    filterSegmantsToDispatchSystemJobs,
    findById,
    findFromGiftModel,
    sendGiftToCustomers,
    unpublishGift,
    sendAndUpdateGift,
    getSegmentCustomers,
    justUnpublishGift,
    getAllGiftStat,
    countDocumentsForGifts,
    findFromGiftStatisticsWithMerchant,
    getAllGifts,
    saveHistoricalGifts
}