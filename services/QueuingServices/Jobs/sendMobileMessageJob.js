const logger = require('../../logger');
const axios = require('axios');
const SMSServices = require('../../SMSServices');
const segmentService = require('../../mainBackendServices/segmentsServices');
const { MobileMessage} = require('../../../db/models/MobileMessages');
const { Merchant } = require('../../../db/models/merchant');
const { getCurrentJobName } = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);

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

const updateExecutionPlan = (queryObj, updateObj) => {

  return new Promise((resolve, reject) => {

    MobileMessage.findOneAndUpdate(queryObj, updateObj, { new: true, useFindAndModify: false })

      .exec()

      .then((mobileMessage) => resolve(mobileMessage))

      .catch(error => reject(`error2 in job: ${jobName} - ${error}`));

  });

}

const updateExecutionPlanMessageStatus = (mobileMessage, execPlan, messageData, messageIndex) => {
  console.log("messageData",messageData.success)
  return new Promise((resolve, reject) => {
    console.log( messageData, messageIndex)
    const smsMessageId = messageData.data.MessageID;
    const cost = messageData.data.Cost;
    const balance = messageData.data.Balance;
    const currency = messageData.data.CurrencyCode;

    let messageToUpdate = execPlan.messageStatus[messageIndex];
      messageToUpdate.smsMessageId = smsMessageId;
      messageToUpdate.balance = balance;
      messageToUpdate.cost = cost;
      messageToUpdate.currency = currency;
    if (smsMessageId && parseFloat(cost)>0) {
      messageToUpdate.sendStatus = "done";
    } else {
      messageToUpdate.sendStatus = "failed";
    }

    execPlan.messageStatus[messageIndex] = messageToUpdate;


    updateExecutionPlan(
      {
        "_id": mobileMessage._id,
        "exectutionPlans._id": execPlan._id,
      },
      {
        "$set": {
          "exectutionPlans.$": execPlan
        }
      }
    )

      .then((mobileMessage) =>resolve(mobileMessage))

      .catch(error => reject(`error5 in job: ${jobName} - ${error}`));

    //emailCampaign

  });
}


const doSendSms = (mobileMessage, execPlan, merchant) => {

  const messagesStatusList = [];

  execPlan.messageStatus.forEach((message, messageIndex) => {
    //console.log(message)
    messagesStatusList.push(new Promise((resolve, reject) => {
      const messageSms = mobileMessage.mobileMessages.id(message.messageId);
      //console.log(messageSms)
      if (!messageSms) reject(`error in job: ${jobName} - we cant find email Message plan`);
        
      const messagingList = messageSms.numbers.map(m => m)
      //console.log( messagingList[0]);
      //support one message
      SMSServices.sendSMS({ message: mobileMessage.messageContent, number: messagingList[0] })

        .then((result) => {
          //console.log("result",result);
          updateExecutionPlanMessageStatus(mobileMessage, execPlan, result, messageIndex)

            .then((success) => resolve(success))

            .catch((error) => reject(error))

        })

        .catch((error) => {
          //console.log("error",error);
          updateExecutionPlanMessageStatus(mobileMessage, execPlan, error, messageIndex)

            .then((success) => reject(success))

            .catch((error2) => reject(error2))
        })
    })
    );


  });

  return Promise.all(messagesStatusList);


}

const sendSegmentSms = (mobileMessage, merchant) => {

  return new Promise((resolve, reject) => {

    const execPlan = mobileMessage.exectutionPlans

      .sort((exePlan1, exePlan2) => {

        return new Date(exePlan1.createdAt) - new Date(exePlan2.createdAt);
      })

      .filter((exePlan) => exePlan.planStatus == 'newOne')[0];
      //console.log(execPlan);

    if (!execPlan) return reject(`error in job: ${jobName} - we cant find execution plan`);

    doSendSms(mobileMessage, execPlan, merchant)

      .then((result) => {

        updateExecutionPlan(

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

          .then((mobileMessage) => resolve(mobileMessage))

          .catch((error) => reject(`error in job: ${jobName} - ${error}`));

      })

      .catch((error) => {
        updateExecutionPlan(

          {
            "_id": mobileMessage._id,
            "exectutionPlans._id": execPlan._id,
          },
          {
            "$set": {
              "exectutionPlans.$.planStatus": 'failed'
            }
          }
        )
          .then((mobileMessage) => resolve(mobileMessage))

          .catch((error2) => reject(`error in job: ${jobName} - ${error2}`));
      })
  });

}

const findMessageById = (id) => {

  return new Promise((resolve, reject) => {

    if (!id) reject(`${jobName} data has no _id`);

    MobileMessage.findOne({ _id: id })

      .populate([{
        path: 'merchant',
        model: 'Merchant'
      }, {
        path: 'segment',
        model: 'Segments'
      }])

      .then((messageCampaign) => resolve(messageCampaign))

      .catch((error) => reject(`error in job: ${jobName} - ${error}`));
  });
}

const updateMobileMessageSegment = async (merchantId, mobileMessage) => {

  const segment = await segmentService.createCustomSegment(merchantId, mobileMessage.numbers);

  return await updateExecutionPlan({ _id: mobileMessage._id }, {
    $set: {
      segment: segment._id,
      updatedAt: new Date()
    }
  });

}

const run = async (data) => {
  const mobileMessage = await findMessageById(data._id)

  if (!mobileMessage) throw `no mobileMessage with this Id ${data._id}`;

  if (!mobileMessage.merchant) throw 'no merchant id';

  const merchant = mobileMessage.merchant;

  const messagesCount = mobileMessage.numbers.length;

  if (mobileMessage.isCustomSegment) {

    let updatedMobileMessage = mobileMessage;

    if (messagesCount && !mobileMessage.segment)
      updatedMobileMessage = await updateMobileMessageSegment(merchant._id, mobileMessage);

    if (!updatedMobileMessage.mobileMessages.length) {

      const customers = await segmentService.getSegmentCustomers(merchant, [updatedMobileMessage.segment]);

      updatedMobileMessage = await createMobileMessages(updatedMobileMessage, customers);
    }

    updatedMobileMessage = await createExecutionPlan(updatedMobileMessage);

    return await sendSegmentSms(updatedMobileMessage, merchant);

  } else {

    let updatedMobileMessage = mobileMessage;

    if (!updatedMobileMessage.segment) throw `not segment for mobile campagin ${mobileMessage._id}`;

    if (updatedMobileMessage.mobileMessages.length) {
      updatedMobileMessage = await updateExecutionPlan({ _id: mobileMessage._id },
        {
          $set: {
            mobileMessages: [],
            updatedAt: new Date()
          }
        }
      );
    }
    const customers = await segmentService.getSegmentCustomers(merchant, [updatedMobileMessage.segment]);
    //console.log(updatedMobileMessage);
    updatedMobileMessage = await createMobileMessages(updatedMobileMessage, customers);
    //console.log(updatedMobileMessage);
    updatedMobileMessage = await createExecutionPlan(updatedMobileMessage);
    //console.log(updatedMobileMessage);
    return await sendSegmentSms(updatedMobileMessage, merchant);
  }

}

module.exports = run ;

