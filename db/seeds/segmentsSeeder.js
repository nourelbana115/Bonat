const logger = require('../../services/logger');
const segmentServices = require('../../services/mainBackendServices/segmentsServices');



const run = async (data) => {
    
    const merchentId = data.merchantId;
    
    if(!merchentId)  throw `can't find merchent Id`;
    
    let segments = await segmentServices.findIfDefaultSegmetsExist(merchentId);
    
    if(!segments.length)  segments = await segmentServices.addingDefaultSegments(merchentId);
   
    if(!segments.length)  throw `can't create segments for merchant ${merchentId}`;

    return segments;
}


module.exports = run;