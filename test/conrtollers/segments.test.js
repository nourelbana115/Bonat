process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should()
​
const sinon = require('sinon');
const segmentsMock = require('../mocks/segmentsMock');
​
describe('Testing segments routes', () => {
  let outsideToken;
  let insideToken;
  let everyoneCount;
​
  before((done) => {
    chai.request(`${process.env.MAIN_BACKEND_API}login`)
      .post('/')
      .send({
        "email": "Lasoft@gmail.com",
        "password": "Lasoft@1234"
      })
      .end((err, res) => {
        if (err) done(err);
        outsideToken = res.body.data.token;
        done()
      });
  });
​
  describe('Second step of getting authenticated', () => {
    // then get our token
    it('should give us an token', (done) => {
      chai.request(app)
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
        .end((err, res) => {
          if (err) done(err);
          insideToken = res.body.ourToken;
        });
      done();
    });
  });
​
  describe('testing GET / LIST', () => {
    it('should return segments list', (done) => {
      chai.request(app)
        .get(`${process.env.TESTING_ROUTE}segments/list`)
        .set('Content-type', 'application/json')
        .set('x-auth', insideToken)
        .set('outSideToken', outsideToken)
        .end((err, res) => {
          if (err) done(err);
          // console.log(res.error)
          res.should.have.status(200);
          res.type.should.equal('application/json');
          res.body.should.be.a('object');
          res.body.data.segments.should.be.a('array');
          res.error.should.equal(false);
          res.body.data.segments.forEach(e => {
            e.should.include.keys('_id', 'segmentType', 'segmentData', 'updatedAt', 'createdAt')
            e._id.should.be.a('string')
            e.segmentData.should.be.a('object')
            e.segmentType.should.be.a('string')
            e.updatedAt.should.be.a('string')
            e.createdAt.should.be.a('string')
          });
        });
      done();
    });
  });
​
  describe('testing GET / stats', () => {
    it('should return segment stats', (done) => {
      chai.request(app)
        .get(`${process.env.TESTING_ROUTE}segments/list-count`)
        .set('Content-type', 'application/json')
        .set('x-auth', insideToken)
        .set('outSideToken', outsideToken)
        .end((err, res) => {
          if (err) done(err);
          // console.log(res.error)
          res.should.have.status(200);
          res.type.should.equal('application/json');
          res.body.should.be.a('object');
          res.error.should.equal(false);
          res.body.data.should.be.a('object');
          res.body.data.segmentsCount.should.be.a('object');
          res.body.data.segmentsCount.should.include.keys(
            'newCustomers',
            'everyone',
            'lostCustomers',
            'superFan',
            'birthday'
          );
          res.body.data.segmentsCount.newCustomers.should.be.a('number');
          res.body.data.segmentsCount.everyone.should.be.a('number');
          res.body.data.segmentsCount.lostCustomers.should.be.a('number');
          res.body.data.segmentsCount.superFan.should.be.a('number');
          res.body.data.segmentsCount.birthday.should.be.a('number');
          everyoneCount= res.body.data.segmentsCount.everyone
          res.body.data.segmentsCount.newCustomers.should.be.below(res.body.data.segmentsCount.everyone);
          res.body.data.segmentsCount.lostCustomers.should.be.below(res.body.data.segmentsCount.everyone);
          res.body.data.segmentsCount.superFan.should.be.below(res.body.data.segmentsCount.everyone);
          res.body.data.segmentsCount.birthday.should.be.below(res.body.data.segmentsCount.everyone);
          done();
        });
    });
  });
​
  describe('testing get /customer/stats',(done)=>{
    it('should return customer stats length ', (done) =>{
     
      chai.request(app)
      .get(`${process.env.TESTING_ROUTE}customer/stats/?segmentType=everyone`)
      .set('Content-type', 'application/json')
      .set('x-auth',insideToken)
      .set('outSideToken',outsideToken)
      .end((err,res)=>{
        if(err)done(err);
        console.log(res.body.data.customers.length)
         res.body.data.customers.length.should.equal(everyoneCount)
         //console.log(res.body.data.customers.length)
         done()
      }
​
      )
    })
  })
​
​
});
Collapse
