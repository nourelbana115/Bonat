const logger = require('../services/logger');

const { Segment } = require('../db/models/Segments');

const segmentsServices = require('../services/mainBackendServices/segmentsServices');

const {SegmentStatistics} = require('../db/models/SegmentStatistics');

const {generalResponse} = require('../requests/helpers/responseBody');



const listSegmentsResponse = async (merchant,segmentType) => {

    segmentType = segmentType || "default";

    switch (segmentType) {
        case "all":
            return await Segment.find({merchant:merchant.id});
            break;
        case "default":
            return await segmentsServices.getDefaultSegments(merchant); 
            break;
        case "customSegment":
            return await Segment.find({merchant:merchant.id,segmentType:{$in:["customSegment"]}});
            break;
    
        default:
            return await segmentsServices.getDefaultSegments(merchant);
            break;
    }

}


const listSegments = (req,res) => {
    
    listSegmentsResponse(req.merchant,req.query.segmentType)

    .then(segments => {
        res.send(generalResponse({segments:filterSegments(segments)}));
    })

    .catch(error => {
        logger.log('general','error',error,"List Segment");
        res.status(400).send(generalResponse({},[],"We can't get your default segments."));
    })

}

const listSegmentsCount = (req,res) => {
    
    listSegmentsResponse(req.merchant,"default")

    .then(segments => {
        const segmentsCount = segments.reduce((segmentsCountObj,segment) =>{
            segmentsCountObj[segment.segmentType] = segment.segmentData.segmentUserCount.value;
            return  segmentsCountObj;
        },{})
        res.send(generalResponse({segmentsCount:segmentsCount}));
    })

    .catch(error => {
        logger.log('general','error',error,"List Segment");
        res.status(400).send(generalResponse({},[],"We can't get your default segments."));
    })

}

const findLastSegmentStatDoc = async(segmentId) => {

    return await SegmentStatistics.findOne({segment:segmentId}).sort({createdAt:-1});

}

const listSegmentsStatsResponse = async (merchant) => {
    
    const SegmentsList = [];

    const segments = await segmentsServices.getDefaultSegments(merchant);

    if(!segments.length) Promise.reject(`there is no segments for merchant ${merchant._id}`);
    let totalCustomers = 0 ;
   
    for (segment of segments){
        const segmentStats = await findLastSegmentStatDoc(segment._id);
        if(segmentStats){
            if(segment.segmentType == 'everyone')
            totalCustomers =segmentStats.userCount 
        console.log(totalCustomers)
        SegmentsList.push({
            type:segment.segmentType,
            label: getsegmentlabel(segment.segmentType),
            percentage:segmentStats.percentageOfSegment,
            amount:segmentStats.userCount,
            decrease:(segmentStats.percentageDiff<0)?Math.abs(segmentStats.percentageDiff):0,
            increase:(segmentStats.percentageDiff>0)?segmentStats.percentageDiff:0,
        })
      }
    }
    
    return {SegmentsList , totalCustomers };

}

const getsegmentlabel = (segmentType) => {
   switch (segmentType) {
       case "newCustomers":
           segmentType  = "New Customers"
           break;
        case "lostCustomers":
           segmentType  = "Lost Customers"
           break;
        case "everyone":
           segmentType  = "Everyone"
           break;
        case "superFan":
           segmentType  = "Super Fan"
           break;
        case "birthday":
           segmentType  = "Birthday"
           break;
       default:
           break;
   } 
   return segmentType;
}

const filterSegments = (segments) =>{
    return segments.map(segment => {
        segment.segmentData.segmentUserCount = undefined;
        return segment;
    })
}

const listSegmentsStats = (req,res) => {
    
    listSegmentsStatsResponse(req.merchant)

    .then(response=> {
        res.send(generalResponse({segmentsStats:response.SegmentsList,totalCustomers:response.totalCustomers}));
    })

    .catch(error => {
        logger.log('general','error',error,"List Segment Stats");
        console.log(error)
        res.status(400).send(generalResponse({},[],"We can't get your default segments statistics."));
    })
    

}



module.exports = {
    listSegments,
    listSegmentsStats,
    listSegmentsCount
}