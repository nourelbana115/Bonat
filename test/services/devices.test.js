process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should();
const segmentsServices = require('../../services/mainBackendServices/segmentsServices')
const { Device } = require('../../db/models/devices');
const { Merchant } = require('../../db/models/merchant');

const customersMock = require('../mocks/customersMock')
const sinon = require('sinon');


const testData = async () =>{
  const devices =[
    {
    "idMerchant": "1003",
    "idBranch": 1001,
    "idDevice": 146,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1001,
    "idDevice": 145,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1001,
    "idDevice": 145,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1001,
    "idDevice": 144,
    
    }
    ,{
    "idMerchant": "1003",
    "idBranch": 1001,
    "idDevice": 143,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1021,
    "idDevice": 138,
    
    }
    ,
    {
    "idMerchant": "1003",
    "idBranch": 1021,
    "idDevice": 139,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1021,
    "idDevice": 140,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1021,
    "idDevice": 141,
    
    }
    ,
    {
    "idMerchant": "1003",
    "idBranch": 1021,
    "idDevice": 142,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1031,
    "idDevice": 138,
    
    }
    ,
    {
    "idMerchant": "1003",
    "idBranch": 1031,
    "idDevice": 139,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1031,
    "idDevice": 140,
    
    },
    {
    "idMerchant": "1003",
    "idBranch": 1031,
    "idDevice": 141,
    
    }
    ,
    {
    "idMerchant": "1003",
    "idBranch": 1031,
    "idDevice": 142,
    
    }
  ]
  const savedDevices = await Device.insertMany(devices)

  const merchant = [{idMerchant:1003, name:"fyoz", email:"ibrhaim2@gmail.com", phoneNumber:"010101010101",
token:'08cd7c6278851244fc5f1732e10b8e02a7e9c204e21182c293b8932de6b160434906de4ba3a4dee1ad3fcda0fc19d706193943679d235403dabc4544943047e0'
,merchantImageUrl:'google.com'
}]
  const createdMerchant = await Merchant.insertMany(merchant)
  return {createdMerchant,savedDevices}
}

describe('Testing device services', () => {

        before((done)=>{
          testData().then(response =>{
            // console.log(response)
            done()
          })
        });

  describe('testing creating a new device ', () => {
    it('should create new device', (done) => {
      const newDevice = new Device({"idMerchant": "1003",
      "idBranch": 1001,
      "idDevice": 120,})
      newDevice.save().then(newDevice =>{
       newDevice._doc.should.include.key(
         "_id",
         "idMerchant",
         "idBranch",
         "idDevice"
       )
       done()
     })
    })
  })

  describe('testing getting devices', () => {
    it('should return 5 devices for branch 1031', (done) => {
      Device.find({idBranch:"1031"})
      .then(devices =>{
        devices.length.should.eql(5)
        done()
      })
    })
    it('should return 5 devices for branch 1021', (done) => {
      Device.find({idBranch:"1021"})
      .then(devices =>{
        devices.length.should.eql(5)
        done()
      })
    })
    it('should return 6 devices for branch 1001', (done) => {
      Device.find({idBranch:"1001"})
      .then(devices =>{
        devices.length.should.eql(6)
        done()
      })
    })
  })
})