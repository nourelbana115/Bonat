require('../config/config');
// const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
// const axios = require('axios');
const express = require('express');
// var router = express.Router();
// const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
// const upload = require('../services/multer');
// const singleUpload = upload.single('image');

let app = express();
app.use(bodyParser.json());

const mongo = require('mongodb').MongoClient
const dbUrl = 'mongodb://localhost:27017'

// let { mongoose } = require('../db/mongoose');
let { Merchant } = require('../db/models/merchant');
// let { Receipts } = require('../db/models/Receipts');
// let { DailyAverageSales } = require('../db/models/DailyAverageSales');
// let { Coupons } = require('../db/models/Coupons');
let { Gift } = require('../db/models/gifts');
let { GiftStatistics } = require('../db/models/giftStatistics');
// let { statistics } = require('../db/models/statistics')
// let { Ads } = require('../db/models/Ads');
// let { authenticate } = require('../middleware/authenticate');
let segmentModule = require('../routes/segments')
const giftServices= require('../services/mainBackendServices/giftsServices');
const {generalResponse} = require('../requests/helpers/responseBody');
const queue = require('../services/QueuingServices/queue');
const Segment = require('../db/models/Segments');
const segmentServices = require('../services/mainBackendServices/segmentsServices');

// add a gift 
exports.addGift = (req,res)=>{
    let body = _.pick(req.body, ['title', 'title_ar', 'description', 'description_ar','discount'
    , 'numOfValidDays', 'imageUrl','status' ,'dashboardData', 'segment']);
    let merchantData = req.merchant;
    let name = body.segment.name
    segmentServices.findSegmentBySegmentType(req.merchant,name)

    .then(returnedSegment =>{
        let status = body.status === 'drafted' ? 'draft' : 'created';
        const giftSegmentId = (name=="superFan")?'send_once':body.segment.options.id
        let giftData = {
            merchant:merchantData._id,
            title: body.title,
            title_ar: body.title_ar,
            description: body.description,
            description_ar: body.description_ar,
            discount:body.discount,
            status:status,
            numOfValidDays: body.numOfValidDays,
            imageUrl: body.imageUrl,
            dashboardData:JSON.stringify(body.dashboardData),
            idCampaignType: 5,
            segment:returnedSegment._id,
            giftSegmentId:giftSegmentId,
            sendDate:sendDateHelper(name,giftSegmentId,body.segment.options),
            expirationDate:expirationDateHelper(name,giftSegmentId,body.segment.options)
        }
    
            giftServices.saveGift(giftData)
            .then((savedGift)=>{
                if( savedGift.status !== 'draft' ) giftServices.filterSegmantsToDispatchJobs(name,savedGift)
                const createdGift = giftsMaper([savedGift])[0];
                res.send(generalResponse(createdGift,[],'gift added successfully '))
            })
            .catch((err) =>
            {
                res.status(400).send(generalResponse({},[],'error in creating new gift '))
             
            })
        
    })

    .catch(error =>{
        console.log(error)
        res.status(400).send(generalResponse({},[],'error in getting Segmnent'))
    })
   
    
 
  
 
    
}

// get active gifts

// get active gifts
exports.getActiveGifts = (req,res)=>{

    let query ={merchant:req.merchant._id,status:'active'}
    giftServices.findFromGiftModel(query)
    .then((response)=>{
      let msg = !response.length?  'no gifts found yet ' : 'gifts found successfully '; 
      const activeGifts = giftsMaper(response);
      res.send(generalResponse({"gifts":activeGifts},[],msg))
    })
    .catch((err)=>{
      res.status(400).send(generalResponse({},[],'Error Finding Active Gifts '))
    })
  
  }
  

exports.getAllGifts = (req,res)=>{
 
    let query ={merchant:req.merchant._id}
    giftServices.findFromGiftModel(query)
    .then((response)=>{
      let msg = !response.length?  'no gifts found yet ' : 'gifts found successfully '; 
      const allGift = giftsMaper(response);
      res.send(generalResponse({"gifts":allGift},[],msg))
    })
    .catch((err)=>{
      res.status(400).send(generalResponse({},[],'Error Finding Active Gifts '))
    })
}

exports.getTitles = (req,res) =>{
    //get program list for current merchant
    let query ={merchant:req.merchant._id,status:'active'}
    giftServices.findFromGiftModel(query)
    .then((response)=>{
    let msg = !response.length?  'no titles found yet ' : 'gifts titles found successfully '; 
    let titles = response.map((gift) =>{ return { title:gift.title,_id:gift._id}})
    res.send(generalResponse({"titles":titles},[],msg))
  })
  .catch((err)=>{
    res.status(400).send(generalResponse({},[],'Error Finding Active Gifts '))
  })
}

// set drafted gift as active
exports.publishGifts = (req,res)=>{
    let body = _.pick(req.body, ['_id'])

    let query = { _id: body._id, merchant: req.merchant._id }

    giftServices.findFromGiftModelWithSegment(query)

    .then((response)=>{

        if(!response) res.status(400).send(generalResponse({},[],"can't find gift "))

        if(response.status !== 'draft') res.status(400).send(generalResponse({},[],'this gift is not a draft'))

        else {
            let segmentName = response.segment.segmentType
            let segmentId = response.segment._id
            let giftId = response._id 

           if(segmentName === 'customSegment') giftServices.dispatchCustomSegmentJob(segmentId,giftId)

           else giftServices.filterSegmantsToDispatchJobs(segmentName,response)
           const createdGift = giftsMaper([response])[0];
           res.send(generalResponse({"gift":createdGift},[],'gift published successfully'))
        }
    })
    .catch((err) => res.status(400).send(generalResponse({},[],"can't publish gift ")))

}

// unpublish or stop gift
exports.unpublishGifts= (req,res)=>{

    let body = _.pick(req.body, ['_id'])

    if (!body._id) {
        return res.status(400).send(generalResponse([],[],"missing gift id" ))
    }

    giftServices.justUnpublishGift(body._id)
    .then((response) => res.send(generalResponse({"gift":response},[],'gift updated ')))
    .catch((err) => res.status(400).send(generalResponse({},[]," unable to unpublish gift ")))
}

// get gift statistics
exports.giftStatistics = (req,res)=>{
    
    let query ={gift:req.params.id}
    giftServices.findFromGiftStatisticsModels(query)
    .then((response)=>{
        console.log(response)
        let msg = !response ?  'no gift Statistics found yet ' : 'gift statistics found successfully '; 
        res.send(generalResponse({"GiftStatistics":response},[],msg))
        
    })
    .catch((err) => res.status(400).send(generalResponse({},[],"can't find this gift statistics")))
}


// send gift for specified
exports.customGifts = (req,res)=>{
    let body = _.pick(req.body, ['title', 'title_ar', 'description', 'description_ar', 'discount',
    'numOfValidDays', 'imageUrl','status', 'dashboardData', 'customers']);
    let merchant = req.merchant._id;
    let customers = body.customers
    let status = body.status === 'drafted' ? 'draft' : 'created';
    let giftData = {
        merchant:merchant,
        title: body.title,
        title_ar: body.title_ar,
        description: body.description,
        description_ar: body.description_ar,
        numOfValidDays: body.numOfValidDays,
        imageUrl: body.imageUrl,
        status:status, 
        discount: body.discount,
        dashboardData:JSON.stringify(body.dashboardData),
        giftSegmentId:'send_once',
        idCampaignType:5,

    }
    giftServices.createCustomSegmentGift(merchant,customers,giftData)  
    .then((response)=>{
        const createdGift = giftsMaper([response])[0];
        res.send(generalResponse(createdGift,[],'gift added'))

    })
    .catch((err) => res.status(400).send(generalResponse({},[],'can not create custom gift')))
}

exports.getAllGiftsStatistics =(req,res) =>{
 
    giftServices.findFromGiftStatisticsWithMerchant({})
    .then((response)=>{
        
        let merchantId = JSON.stringify(req.merchant._id)

        let merchantGifts =response.filter((element)=>  JSON.stringify(element.gift.merchant) === merchantId )

        let msg = !merchantGifts.length ?  'no gifts Statistics found yet ' : 'gifts statistics found successfully '; 

        res.send(generalResponse({"GiftsStatistics":merchantGifts},[],msg))
        
    })
    .catch((err) => res.status(400).send(generalResponse({},[],"can't find this gift statistics")))
}
const giftsMaper = (giftsArray) =>{
    return giftsArray.map(gift =>{
        if(gift.status == 'created')
            gift.status = 'active';
        else if (gift.status == 'draft')
            gift.status = 'drafted';
        return gift;
    });
}

const sendDateHelper  = (segmentType,giftSegmentId,options) => {
    
    if(segmentType == 'superFan')
        return null;
        
    else if(segmentType == 'birthday' && giftSegmentId == 'send_this_month')
    return new Date();  
    else if(segmentType == 'everyone' && giftSegmentId == 'send_on_particular_date')
    return options.sendDate.startDate; 
    else if(segmentType == 'birthday' && giftSegmentId == 'send_till_particular_date')
    return options.sendDate.startDate; 
    else
        return options.sendDate;
        
    
}
const expirationDateHelper  = (segmentType,giftSegmentId,options) => {
    
   
    if(segmentType == 'everyone' && giftSegmentId == 'send_on_particular_date')
    return options.sendDate.expirationDate; 

    else if(segmentType == 'birthday' && giftSegmentId == 'send_till_particular_date')
    return options.sendDate.expirationDate; 

    else
        return null;
        
    
}
