process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should()

const sinon = require('sinon');
const segmentsMock = require('../mocks/segmentsMock');

describe('Testing segments routes', () => {

    let outsideToken;
    let insideToken;
    let everyoneCount;

    before(async() => {
        this.timeout(10000)
       const res=  chai.request(`${process.env.MAIN_BACKEND_API}login`)
          .post('/')
          .send({
            "email": "Lasoft@gmail.com",
            "password": "Lasoft@1234"
          })
         
            
            outsideToken = res.body.data.token;
            console.log(outsideToken)
          
         
      })
    
      describe('Second step of getting authenticated', () => {
        // then get our token
        it('should give us an token', async(done) => {
            this.timeout(10000)
       const res= chai.request(app)
            .post(`${process.env.TESTING_ROUTE}info`)
            .send({
              "token": outsideToken,
              "idStatus": 1,
              "idMerchant": "1000",
              "phoneNumber": "01010101001",
              "name": "Demo",
              "name_ar": "ديمو",
              "merchantImageUrl": "https://storage.googleapis.com/bonatdev.appspot.com/15748415439450.jpeg",
              "email": "Lasoft@gmail.com",
              "idSubscription": 2,
              "idPos": 1,
              "posTitle": "Square",
            })
            .
              
              insideToken = res.body.ourToken;
              console.log(insideToken)
            });
         
        });
      });
