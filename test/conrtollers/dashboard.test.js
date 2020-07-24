process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should()
const dashboardServices = require('../../services/mainBackendServices/dashboardServices')
const sinon = require('sinon');
const { Merchant } = require('../../db/models/merchant');

const dashboardMock = require('../mocks/dashboardMock');

function sum(arr) {
  let sum = 0;
  for (i of arr) {
    sum += Number(i);
  }
  return sum;
}

const testData = async () =>{
  const merchant = [{idMerchant:1005, name:"fyoz", email:"test@gmail.com", phoneNumber:"0120304556",
token:'08cd7c6278851244fc5f1732e10b8e02a7e9c204e21182c293b8932de6b160434906de4ba3a4dee1ad3fcda0fc19d706193943679d235403dabc4544943047e0'
,merchantImageUrl:'google.com'
}]
  const createdMerchant = await Merchant.insertMany(merchant)
  return createdMerchant
}
describe('Testing dashboard routes', () => {
  let merchant, campaignId;
  before((done)=>{
    testData().then(response =>{
      // console.log(response)
      merchant = response[0]
      done()
    })
  });
  describe('testing feedback chart', () => {
    it('should return feedback chart', async () => {
      const req = {}
      const res = {
        send: sinon.spy()
      }
      const request = {}
      const response = {
        send: sinon.spy()
      }

      dashboardMock.mockFeedbackChart(req, res);
      dashboardMock.mockFeedbackApi(request, response);

      response.send.calledOnce.should.equal(true);
      res.send.calledOnce.should.equal(true)

      res.send.firstCall.lastArg.should.be.a('object');
      res.send.firstCall.lastArg.feedback.should.be.a('array');
      res.send.firstCall.lastArg.feedback.forEach(e => {
        e.should.include.keys(
          'type',
          'label',
          'percentage',
          'amount',
          'increase',
          'decrease'
        );
        e.type.should.be.a('string');
        e.label.should.be.a('string');
        e.percentage.should.be.a('number');
        e.amount.should.be.a('number');
        e.increase.should.be.a('number');
      });
      sum(res.send.firstCall.lastArg.feedback.map(feed => feed.percentage)).should.be.within(98, 102);
      sum(res.send.firstCall.lastArg.feedback.map(feed => feed.amount)).should.equal(response.send.firstCall.lastArg.data.customers.length);

    });
  });

  describe('testing customers chart', () => {
    it('should return default values', (done) => {
      const req = {
        merchant:merchant
      }
      const res = {
        send:sinon.spy()
      }
      
      dashboardServices.findAllDailyData(req, new Date())
      .then(response=>{
        response.should.be.an('object')
        response.totalReturnCustomers.should.equal(0)
        response.totalNewCustomers.should.equal(0)
        response.visits.should.be.an('array')
        done()

      })
    
    });
  });
  describe('testing get general ', () => {
  
    it('should return default values',(done) => {
      const req = {
        merchant:merchant
      }
     
     dashboardServices.getGeneralData(req)
      .then(response=>{
        
        response.should.be.an('object')
        response.quickActions.should.be.an('array')
        response.quickActions[0].type.should.equal('bonatCustomers')
        response.quickActions[1].type.should.equal('customersFeedback')
        response.quickActions[2].type.should.equal('loyaltyProgram')
        response.quickActions[0].items.should.be.an('array')
        response.quickActions[1].items.should.be.an('array')
        response.quickActions[2].items.should.be.an('array')
         done()
      })
     
    });
  });
})