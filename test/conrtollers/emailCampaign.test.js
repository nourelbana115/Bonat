process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should();
const adsController = require('../../controllers/adsController')
const segmentService = require('../../services/mainBackendServices/segmentsServices')
const emailCampaignMocks = require('../mocks/emailCampaignMock')
const smsCampaignMocks = require('../mocks/smsMock')
const { Merchant } = require('../../db/models/merchant');
const Customer = require('../../db/models/Customers');

const sinon = require('sinon');


const testData = async () =>{
  const merchant = [{idMerchant:1003, name:"fyoz", email:"ibrhaim2@gmail.com", phoneNumber:"010101010101",
token:'08cd7c6278851244fc5f1732e10b8e02a7e9c204e21182c293b8932de6b160434906de4ba3a4dee1ad3fcda0fc19d706193943679d235403dabc4544943047e0'
,merchantImageUrl:'google.com'
}]
  const createdMerchant = await Merchant.insertMany(merchant)
  const segments = await segmentService.addingDefaultSegments(createdMerchant[0]._id)
  const everyoneSegment = segments.find(elemnt=>elemnt.segmentType =='everyone')
  const customers = [
    {
        "merchant": createdMerchant[0]._id,
        "segments": [everyoneSegment._id],
        "idCustomer": "1002",
        "customerData": {
            "idCustomer": 1001,
            "name": null,
            "gender": null,
            "birthday": "2019-11-21",
            "birthdate": "2019-11-21",
            "age": null,
            "createdAt": "2019-05-10T16:53:38.000Z",
            "email": 'samiha@gmail.com',
            "phoneNumber": "966559922217",
            "numberOfPunches": 1,
            "visits": 134,
            "payments": "1052000.00",
            "lastVisit": "2019-05-28T19:03:15.000Z",
            "usedRewards": "0",
            "usedCoupons": "0"
        },
        "updatedAt": "2019-11-09T20:28:24.024Z",
        "createdAt": "2019-10-31T10:15:00.769Z"
    },
    {
        "merchant": createdMerchant[0]._id,
        "segments": [everyoneSegment._id],
        "idCustomer": "1002",
        "customerData": {
            "idCustomer": 1001,
            "name": null,
            "birthdate": "2019-11-21",
            
            "gender": null,
            "birthday": "2019-11-21",
            "age": null,
            "createdAt": "2019-05-10T16:53:38.000Z",
            "email": 'samiha@gmail.com',

            "phoneNumber": "966559922217",
            "numberOfPunches": 1,
            "visits": 134,
            "payments": "1052000.00",
            "lastVisit": "2019-05-28T19:03:15.000Z",
            "usedRewards": "0",
            "usedCoupons": "0"
        },
        "updatedAt": "2019-11-09T20:28:24.024Z",
        "createdAt": "2019-10-31T10:15:00.769Z"
    },
    {
        "merchant": createdMerchant[0]._id,
        "segments": [everyoneSegment._id],
        "idCustomer": "1002",
        "customerData": {
            "idCustomer": 1001,
            "name": null,
            "gender": null,
            "birthday": "2019-11-21",
            "birthdate": "2019-11-21",
            "age": null,
            "createdAt": "2019-05-10T16:53:38.000Z",
            "email": 'samiha@gmail.com',
            "phoneNumber": "966559922217",
            "numberOfPunches": 1,
            "visits": 134,
            "payments": "1052000.00",
            "lastVisit": "2019-05-28T19:03:15.000Z",
            "usedRewards": "0",
            "usedCoupons": "0"
        },
        "updatedAt": "2019-11-09T20:28:24.024Z",
        "createdAt": "2019-10-31T10:15:00.769Z"
    }]
  const savedCustomer =await Customer.insertMany(customers)

  return createdMerchant
}

describe('Testing emailCampaign', () => {
let merchant, campaignId;
        before((done)=>{
          testData().then(response =>{
            // console.log(response)
            merchant = response
            done()
          })
        });

  describe('testing creating a emailCampaign ', () => {
    it('should create new emailCampaign', async () => {
    const body = {
        campaignTitle:"test tiltle",
        campaignEmailContent:"<html><body><h1>Hello  مرحبا</h1><p style='color:red'>Sample description</p> <p>Time 1517831318946</p></body></html>",
        campaignFor:"5d27c9c6889a1272dc240327",
        campaignForModel:"Coupons",
        sms:null,
        isCustomSegment:false,
        segmentType: "everyone",
        emails:[],
        dashboardData:"{}"
        
     
    }
    const req ={
      merchant:merchant[0]
    }
    let campaign = await adsController.addEmailCampaignDoc(req,body)
    campaignId=campaign._id

  
    campaign._doc.should.include.keys(
      'isCustomSegment',
      'emails',
      '_id',
      'campaignTitle',
      'campaignEmailContent',
      'merchant',
      'dashboardData',
      'mobileMessage',
      'segment',
      'campaignFor',
      'campaignForModel',
      'exectutionPlans',
      'emailMessages',
      'createdAt',
      'updatedAt',
    )
   const finishedCampaign = await emailCampaignMocks.sendEmailCamp(campaign,req.merchant)

     finishedCampaign.length.should.eql(3)
    })
    it('should find an emailCampaign and resend it', async () => {
      const req ={
        merchant:merchant[0]
      }
      
      let campaign = await emailCampaignMocks.findAcamp(campaignId)
      campaign._doc.should.include.keys(
        'isCustomSegment',
        'emails',
        '_id',
        'campaignTitle',
        'campaignEmailContent',
        'merchant',
        'dashboardData',
        'mobileMessage',
        'segment',
        'campaignFor',
        'campaignForModel',
        'exectutionPlans',
        'emailMessages',
        'createdAt',
        'updatedAt',
      )
      campaign.emailMessages.length.should.not.eql(0)
     const finishedCampaign = await emailCampaignMocks.sendEmailCamp(campaign,req.merchant)
  
       finishedCampaign.length.should.eql(3)
    })
    it('should create an sms campaign ', async () => {
      const body = {
        campaignTitle:"test tiltle",
        campaignEmailContent:"<html><body><h1>Hello  مرحبا</h1><p style='color:red'>Sample description</p> <p>Time 1517831318946</p></body></html>",
        campaignFor:"5d27c9c6889a1272dc240327",
        campaignForModel:"Coupons",
        sms:"Hello from bonat new sms feature23",
        isCustomSegment:false,
        segmentType: "everyone",
        emails:[],
        dashboardData:"{}"
        
     
      }
      const req ={
        merchant:merchant[0]
      }

      let campaign = await adsController.addEmailCampaignDoc(req,body)
      campaign._doc.should.include.keys(
        'isCustomSegment',
        'emails',
        '_id',
        'campaignTitle',
        'campaignEmailContent',
        'merchant',
        'dashboardData',
        'mobileMessage',
        'segment',
        'campaignFor',
        'campaignForModel',
        'exectutionPlans',
        'emailMessages',
        'createdAt',
        'updatedAt',
      )
     const smsCampaign = await smsCampaignMocks.sendSms(campaign,req.merchant)
     smsCampaign.length.should.eql(3)
    })

  })
})