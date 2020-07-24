const logger = require('../../logger');
const axios = require('axios');
const { EmailCampaigns } = require('../../../db/models/EmailCampaigns');
const {Merchant} = require('../../../db/models/merchant');
const {getCurrentJobName} = require('./jobHelpers');
const {sendMail} = require('../../mailSesService');
const segmentService = require('../../mainBackendServices/segmentsServices');

const jobName = getCurrentJobName(__filename);

const getMerchantCustomers = (merchant) => {

    return new Promise((resolve, reject) => {

        let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers`;

        let config = {
            
            headers: {
                "Authorization": `Bearer ${merchant.token}`
            }
        }

        axios.get(url, config)
        
        .then((response) => {
            return resolve(response.data);
        })

        .catch((err) => {

            logger.log('requests', 'error', err, 'Get Merchant Customers');

            return reject(err)
        });
    })
}

const getCustomersEmails = (merchant,customersIds) => {
    
    return new Promise((resolve, reject) => {

        if (!customersIds.length) 
        reject(`${jobName} emailCampaign has no customersIds`);
        
        getMerchantCustomers(merchant)
    
        .then((customers) => {
         
            resolve(customers);
        
        }).catch((error) => reject(error));
    })

}

/*const updateCustomSegmentData = (emailCampaign,customers) => {

    return new Promise((resolve,reject) => {

        if (!customers.length) reject(`${jobName} emails has has no customers`);

        emailCampaign.emails =  emailCampaign.emails.map((email) => {
           
            let segmentCustomers = customers.filter((customer) => {
                 
                return email.customerId == customer.idCustomer && customer.email != null;

            });
            
            return (segmentCustomers.length)?
            {

                customerId:email.customerId,
                _id:email._id,
                email:segmentCustomers[0].email

            }:{customerId:email.customerId, _id:email._id};

        });

        emailCampaign.save()

        .then((mailCampaign) => resolve(mailCampaign))

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));
    }); 
}*/

const findEmailCampaignById = (id) => {

    return new Promise((resolve,reject) => {

        if (!id) reject(`${jobName} data has no _id`);

        EmailCampaigns.findOne({_id:id})
        
        .populate('merchant')

        .then((mailCampaign) => resolve(mailCampaign))

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));
    });
}


/*const findMerchantById = (id) => {

    return new Promise((resolve,reject) => {
       
        if (!id) reject(`${jobName} merchant has no merchantId`);

        Merchant.findOne({_id:id})

        .then((merchant) => resolve(merchant))

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));
    });
}*/



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

        .then((mailCampaign) => resolve(mailCampaign))

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));

    });

}

const createExecutionPlan = (emailCampaign) => { 

    return new Promise((resolve,reject) => {
      
        emailCampaign.exectutionPlans.push({
            messageStatus:emailCampaign.emailMessages.map((message) => {
                return {messageId:message._id};
            })
        });

        emailCampaign.save()

        .then((mailCampaign) => resolve(mailCampaign))

        .catch((error) => reject(`error in job: ${jobName} - ${error}`));
           
    });
  
    
}

const updateExecutionPlan = (queryObj,updateObj) => {

   return new Promise((resolve,reject) => {
       
    EmailCampaigns.findOneAndUpdate(queryObj,updateObj,{new:true,useFindAndModify: false})
    
    .exec()

    .then((mailCampaign) => resolve(mailCampaign))
    
    .catch(error => reject(`error in job: ${jobName} - ${error}`));

   });

}

const updateExecutionPlanMessageStatus = (emailCampaign,execPlan,messageData,messageIndex) => {

    return new Promise((resolve,reject) => {

       const sesMessageId = messageData.MessageId;

        let messageToUpdate = execPlan.messageStatus[messageIndex];

        if(sesMessageId){
            messageToUpdate.sesMessageId = sesMessageId;
            messageToUpdate.requestId = messageData.ResponseMetadata.RequestId;
            messageToUpdate.sendStatus = "done";
        }else{
            messageToUpdate.requestId = messageData.requestId;
            messageToUpdate.sendStatus = "failed";
        }

        execPlan.messageStatus[messageIndex] = messageToUpdate;
       
        
        updateExecutionPlan(
            {
                "_id":emailCampaign._id,
                "exectutionPlans._id":execPlan._id,
            },
            { 
                "$set": {
                    "exectutionPlans.$": execPlan
                }
            }
        )

        .then((mailCampaign) => resolve(mailCampaign))
        
        .catch(error => reject(`error in job: ${jobName} - ${error}`));
        
        //emailCampaign

    });
}

const doSendEmail = (emailCampaign,execPlan,merchant) => {
    
    const messagesStatusList = [];

     execPlan.messageStatus.forEach( (message,messageIndex) => {
        messagesStatusList.push( new Promise ((resolve,reject) => {
            const messageEmails =  emailCampaign.emailMessages.id(message.messageId);
              
            if(!messageEmails) reject(`error in job: ${jobName} - we cant find email Message plan`);
            
            const mailingList = messageEmails.emails.map(m => m)
            
            sendMail(merchant.name,
            mailingList,//['abdalla@bonat.io','ibrahem3amer@gmail.com'],
            emailCampaign.campaignTitle,
            emailCampaign.campaignEmailContent)

            .then((result) => {

                updateExecutionPlanMessageStatus(emailCampaign,execPlan,result,messageIndex)

                .then((success) => resolve(success))

                .catch((error)=>reject(error))

            })

            .catch((error) => {
                
                updateExecutionPlanMessageStatus(emailCampaign,execPlan,error,messageIndex)

                .then((success) => reject(success))

                .catch((error2)=>reject(error2))
            })
       })
    );
       

   });

    return Promise.all(messagesStatusList);


}

const sendSegmentEmails = (emailCampaign,merchant) => {

    return new Promise((resolve,reject) => {
      
       const execPlan = emailCampaign.exectutionPlans

       .sort((exePlan1,exePlan2) => {

           return new Date(exePlan1.createdAt) - new Date(exePlan2.createdAt);
        })

       .filter((exePlan) => exePlan.planStatus == 'newOne')[0];

        
        if(!execPlan) return reject(`error in job: ${jobName} - we cant find execution plan`);
        
        doSendEmail(emailCampaign,execPlan,merchant)
        
        .then((result) => {

            updateExecutionPlan(

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
            
            .then((mailCampaign) => resolve(mailCampaign))

            .catch((error) => reject(`error in job: ${jobName} - ${error}`));

        })

        .catch((error)=> {
            updateExecutionPlan(

                {
                    "_id":emailCampaign._id,
                    "exectutionPlans._id":execPlan._id,
                },
                { 
                    "$set": {
                        "exectutionPlans.$.planStatus": 'failed'
                    }
                }
            )
            .then((mailCampaign) => resolve(mailCampaign))

            .catch((error2) => reject(`error in job: ${jobName} - ${error2}`));
        })
    });

}

const updateEmailCampaignSegment = async(merchantId,emailCampaign) =>{

    const segment = await segmentService.createCustomSegment(merchantId,emailCampaign.emails);
    
    return await updateExecutionPlan({_id:emailCampaign._id},{
       $set:{
           segment:segment._id,
           updatedAt:new Date()
       }
    });

}

const run = async (data) => {
    
    const emailCampaign = await findEmailCampaignById(data._id);

    if(!emailCampaign) throw `no emailCampaign with this Id ${data._id}`;

    if(!emailCampaign.merchant) throw 'no merchant id';
    
    const merchant = emailCampaign.merchant;

    const emailsCount = emailCampaign.emails.length;

    if(emailCampaign.isCustomSegment){

        let updatedEmailCampaign = emailCampaign;

        if(emailsCount && !emailCampaign.segment) 
        updatedEmailCampaign = await updateEmailCampaignSegment(merchant._id,emailCampaign);

        if(!updatedEmailCampaign.emailMessages.length){

            const customers = await segmentService.getSegmentCustomers(merchant,[updatedEmailCampaign.segment]);
            
            updatedEmailCampaign = await createMailMessages(updatedEmailCampaign,customers);
        }

        updatedEmailCampaign = await createExecutionPlan(updatedEmailCampaign);

        return await sendSegmentEmails(updatedEmailCampaign,merchant);

    }else{

        let updatedEmailCampaign = emailCampaign;

        if(!updatedEmailCampaign.segment) throw `not segment for email campagin ${emailCampaign._id}`;
        
        if(updatedEmailCampaign.emailMessages.length){
            updatedEmailCampaign = await updateExecutionPlan({_id:emailCampaign._id},
                {
                    $set:{
                        emailMessages:[],
                        updatedAt:new Date()
                    }
                }
            );
        }
        const customers = await segmentService.getSegmentCustomers(merchant,[updatedEmailCampaign.segment]);
        
        updatedEmailCampaign = await createMailMessages(updatedEmailCampaign,customers);

        updatedEmailCampaign = await createExecutionPlan(updatedEmailCampaign);

        return await sendSegmentEmails(updatedEmailCampaign,merchant);
    }
   
}

module.exports = run;