const _ = require('lodash');
const sesMailingService = require('../services/mailSesService');
const SMSSerivces = require('../services/SMSServices');
const { EmailCampaigns } = require('../db/models/EmailCampaigns');
const mongoose = require('mongoose');
const queue = require('../services/QueuingServices/queue');
const { generalResponse } = require('../requests/helpers/responseBody')
const { MobileMessage } = require('../db/models/MobileMessages');
const request = require('request');
const segmentsSerivces = require('../services/mainBackendServices/segmentsServices');
const paginator = require('../services/paginator')

const sendEmailSES = (req, res) => {

    const body = _.pick(req.body, ['mail', 'title', 'content']);

    sesMailingService.sendMail(
        req.merchant.name,
        body.mail,
        body.title,
        body.content).then(
            (result) => res.status(200).send({ "message": "Your Email Sent successfully" })
            , (error) => res.status(400).send({ "message": error })

            //(error) => res.status(400).send({"message":"Unable To Send This Email"})
        );
}

const listPaginatedMailCampaigns = (req, res) => {
    paginator({ model: EmailCampaigns, query: { merchant: mongoose.Types.ObjectId(req.merchant._id) }, page: req.query.page })
        .then(emailCampaigns => {
            res.status(200).send({ emailCampaigns: emailCampaigns });
        })
        .catch(err => {
            console.log(err)
            res.status(400).send(err);
        })
}

const ListMailsCampaign = (req, res) => {

    EmailCampaigns.find({
        merchant: mongoose.Types.ObjectId(req.merchant._id)
    }).then(
        (emailCompaigns) => {
            res.status(200).send({ "emailCompaigns": emailCompaigns });
        }, (err) => {
            res.status(400).send(err);
        }
    )
}

const addMobileMessageDoc = async (req, body) => {

    const mobileMessageData = {
        messageContent: body.sms,
        merchant: mongoose.Types.ObjectId(req.merchant._id),
        dashboardData: body.dashboardData
    };

    if (body.isCustomSegment) {
        mobileMessageData.numbers = body.emails;
        mobileMessageData.isCustomSegment = true;

    } else {
        const segment = await segmentsSerivces.findSegmentBySegmentType(req.merchant, body.segmentType)
        mobileMessageData.segment = segment._id;
    }

    if (body.campaignForModel && body.campaignFor) {
        mobileMessageData.campaignFor = mongoose.Types.ObjectId(body.campaignFor);
        mobileMessageData.campaignForModel = body.campaignForModel;
    }

    const mobileMessage = new MobileMessage(mobileMessageData);

    return mobileMessage.save()

}

const addEmailCampaignDoc = async (req, body) => {

    let mobileMessageId = null;
    if (body.sms) {
        const newMessage = await addMobileMessageDoc(req, body);
        mobileMessageId = newMessage._id;
    }
    const emailCampaignData = {
        campaignTitle: body.campaignTitle,
        campaignEmailContent: body.campaignEmailContent,
        merchant: mongoose.Types.ObjectId(req.merchant._id),
        dashboardData: body.dashboardData,
        mobileMessage: mobileMessageId,
        campaignStatus: 'newOne'
    };

    if (body.isCustomSegment) {
        emailCampaignData.emails = body.emails;
        emailCampaignData.isCustomSegment = true;

    } else {
        const segment = await segmentsSerivces.findSegmentBySegmentType(req.merchant, body.segmentType)
        emailCampaignData.segment = segment._id;
    }

    if (body.campaignForModel && body.campaignFor) {
        emailCampaignData.campaignFor = mongoose.Types.ObjectId(body.campaignFor);
        emailCampaignData.campaignForModel = body.campaignForModel;
    }

    const emailCampaign = new EmailCampaigns(emailCampaignData);

    return await emailCampaign.save();


}

const addEmailCampaign = (req, res) => {

    const body = _.pick(req.body, [
        'campaignTitle',
        'campaignEmailContent',
        'segmentType',
        'isCustomSegment',
        'campaignFor',
        'campaignForModel',
        'emails',
        'sms',
        'dashboardData'
    ]);


    addEmailCampaignDoc(req, body)

        .then((emailCampaign) => {

            queue.publisher.dispatch(
                {
                    jobfile: "sendingMailCampaignJob",
                    data: {
                        _id: emailCampaign._id
                    }
                });
            if (emailCampaign.mobileMessage) {
                queue.publisher.dispatch(
                    {
                        jobfile: "sendMobileMessageJob",
                        data: {
                            _id: emailCampaign.mobileMessage
                        }
                    });
            }

            res.status(200).send({ "message": "we saved your campaign", "emailCampaign": emailCampaign });

        }).catch((error) => {

            res.status(400).send({ "message": "we couldn't save your campaign", "errors": error });
        })


}

const resendMailCampaign = (req,res) => {
    
    EmailCampaigns.findOne({_id:req.body.campaignId})
    
    .then((emailCampaign) => {
       
        queue.publisher.dispatch(
        {
            jobfile:"sendingMailCampaignJob",
            data:{
                _id:emailCampaign._id
            }
        });

            queue.publisher.dispatch(
                {
                    jobfile: "sendingMailCampaignJob",
                    data: {
                        _id: emailCampaign._id
                    }
                });

            if (emailCampaign.mobileMessage) {
                queue.publisher.dispatch(
                    {
                        jobfile: "sendMobileMessageJob",
                        data: {
                            _id: emailCampaign.mobileMessage
                        }
                    });
            }

            res.status(200).send(generalResponse({
                "emailCampaign": emailCampaign
            }, [], "we ququed your send campaign operation"));


        }).catch((error) => {

            res.status(400).send(generalResponse({}, [], "we can't find email campaign with this campaignId"));

            res.status(400).send(generalResponse({}, [], "we can't find email campaign with this campaignId"));

        });
}

const sendSMS = (req, res) => {
    SMSSerivces.sendSMS(req)
        .then((response) => {
            res.send(generalResponse({ data: response }, [], 'send sms'))
        })
        .catch((err) => {
            res.send(generalResponse({}, err.errors, 'send sms'))
        })
}

module.exports ={
    addEmailCampaignDoc,
    sendEmailSES,
    resendMailCampaign,
    addEmailCampaign,
    sendSMS,
    ListMailsCampaign,
    listPaginatedMailCampaigns
}