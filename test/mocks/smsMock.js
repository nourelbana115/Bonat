const { MobileMessage} = require('../../db/models/MobileMessages');

const segmentService = require('../../services/mainBackendServices/segmentsServices')
  const updateExecutionPlan = (queryObj, updateObj) => {

    return new Promise((resolve, reject) => {
  
      MobileMessage.findOneAndUpdate(queryObj, updateObj, { new: true, useFindAndModify: false })
  
        .exec()
  
        .then((mobileMessage) => resolve(mobileMessage))
  
        .catch(error => reject(`error2 in job: ${jobName} - ${error}`));
  
    });
  
  }
  const doSendSms = (mobileMessage, execPlan, merchant) => {

    const messagesStatusList = [];
    execPlan.messageStatus.forEach((message, messageIndex) => {
      //console.log(message)
      messagesStatusList.push('done');

    });
  
    return messagesStatusList;
  
  
  }
  const createExecutionPlan = (mobileMessage) => {

    return new Promise((resolve, reject) => {
  
      mobileMessage.exectutionPlans.push({
        messageStatus: mobileMessage.mobileMessages.map((message) => {
          return { messageId: message._id };
        })
      });
  
      mobileMessage.save()
  
        .then((mobileMessage) => resolve(mobileMessage))
  
        .catch((error) => reject(`error4 in job: ${jobName} - ${error}`));
  
    });
  
  
  }
  const createMobileMessages = (mobileMessage, customers) => {

    return new Promise((resolve, reject) => {
      //default split count 
      const defaultSpiltNumber = 1;
  
      const validSms = customers.filter((customer) => customer.customerData.phoneNumber != null);
      
      let messagesCount = validSms.length;
  
      //messagesCount = !(messagesCount % 2 == 0) ? Math.floor(messagesCount + 1) : messagesCount;
  
      let messages = [];
  
      for (index = 0; index < messagesCount; index += defaultSpiltNumber) {
  
        messages.push(validSms.slice(index, index + defaultSpiltNumber));
      }
  
      const smsMessages = messages.map((message) => {
        return { numbers: message.map((customer) => customer.customerData.phoneNumber) };
      });
  
      mobileMessage.mobileMessages = smsMessages;
  
      mobileMessage.save()
  
        .then((mobileMessage) => resolve(mobileMessage))
  
        .catch((error) => reject(`error3 in job: ${jobName} - ${error}`));
  
    });
  
  }
  const sendSegmentSms = async (mobileMessage, merchant) => {

    
  
      const execPlan = mobileMessage.exectutionPlans
  
        .sort((exePlan1, exePlan2) => {
  
          return new Date(exePlan1.createdAt) - new Date(exePlan2.createdAt);
        })
  
        .filter((exePlan) => exePlan.planStatus == 'newOne')[0];
        //console.log(execPlan);
    
  
       const update = await updateExecutionPlan(
  
            {
              "_id": mobileMessage._id,
              "exectutionPlans._id": execPlan._id,
            },
            {
              "$set": {
                "exectutionPlans.$.planStatus": 'done'
              }
  
            }
          )
          return doSendSms(mobileMessage, execPlan, merchant)
  
  }  

module.exports={
    sendSms:async(campaign,merchant)=>{
        const customers = await segmentService.getSegmentCustomers(merchant,[campaign.segment]);
           
        campaign = await createMobileMessages(campaign,customers);
   
        campaign = await createExecutionPlan(campaign);
   
        const finishedCampaign = await sendSegmentSms(campaign,merchant) 

        return finishedCampaign
    }
}