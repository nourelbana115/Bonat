const { EmailCampaigns } = require('../../db/models/EmailCampaigns');
const segmentService = require('../../services/mainBackendServices/segmentsServices')

  
  
    const updateExecutionPlan =(queryObj,updateObj) => {

        return new Promise((resolve,reject) => {
            
         EmailCampaigns.findOneAndUpdate(queryObj,updateObj,{new:true,useFindAndModify: false})
         
         .exec()
     
         .then((mailCampaign) => resolve(mailCampaign))
         
         .catch(error => reject(`error in job: ${jobName} - ${error}`));
     
        });
     
    }
    const  doSendEmail  = (emailCampaign,execPlan,merchant) => {
    
        const messagesStatusList = [];
    
         execPlan.messageStatus.forEach( (message,messageIndex) => {
            messagesStatusList.push('done');
       });
       return messagesStatusList;

    }
    const createExecutionPlan = (emailCampaign) =>{
        return new Promise((resolve,reject) => {
      
            emailCampaign.exectutionPlans.push({
                messageStatus:emailCampaign.emailMessages.map((message) => {
                    return {messageId:message._id};
                })
            });
    
            emailCampaign.save()
    
            .then((mailCampaign) => {

                resolve(mailCampaign)})
    
            .catch((error) => reject(`error in job: ${jobName} - ${error}`));
               
        });
    }
   const createMailMessages = (emailCampaign,customers) => {
     return new Promise((resolve,reject) => {
        //default split count 
        const defaultSpiltNumber = 1;

        const validEmails = customers.filter((customer) => customer.customerData.email != null);
        
        let emailsCount = validEmails.length;
        
       // emailsCount = !(emailsCount % 2 == 0)?Math.floor(emailsCount+1):emailsCount;
       
        let messages = []; 

        for ( index = 0 ; index < emailsCount; index += defaultSpiltNumber) {

            messages.push(validEmails.slice(index,index + defaultSpiltNumber));
        }
        
        const emailMessages = messages.map((message) => {
            //console.log(message.map((customer)=>customer.email));
            return {emails:message.map((customer)=>customer.customerData.email)};
        });
       
        emailCampaign.emailMessages = emailMessages;
        
        emailCampaign.save()

        .then((mailCampaign) =>{

         resolve(mailCampaign)})

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));

    });
    }
   const sendSegmentEmails = async(emailCampaign,merchant) => {

          
           const execPlan = emailCampaign.exectutionPlans
    
           .sort((exePlan1,exePlan2) => {
    
               return new Date(exePlan1.createdAt) - new Date(exePlan2.createdAt);
            })
    
           .filter((exePlan) => exePlan.planStatus == 'newOne')[0];
    
            
                let upadte = await updateExecutionPlan(
    
                    {
                        "_id":emailCampaign._id,
                        "exectutionPlans._id":execPlan._id,
                    },
                    { 
                        "$set": {
                            "exectutionPlans.$.planStatus": 'done'
                        }
                        
                    }
                )
            return doSendEmail(emailCampaign,execPlan,merchant)
                
    
    }

module.exports = {

  
    sendEmailCamp:async(campaign,merchant)=>{
        if(campaign.emailMessages.length){
            campaign = await updateExecutionPlan({_id:campaign._id},
                {
                    $set:{
                        emailMessages:[],
                        updatedAt:new Date()
                    }
                }
            );
        }
        const customers = await segmentService.getSegmentCustomers(merchant,[campaign.segment]);
           
        campaign = await createMailMessages(campaign,customers);
   
        campaign = await createExecutionPlan(campaign);
   
        const finishedCampaign = await sendSegmentEmails(campaign,merchant) 

        return finishedCampaign       

    },
    findAcamp:async(id)=>{
      const campaign = await  EmailCampaigns.findById(id)
      return campaign
        
    }
}