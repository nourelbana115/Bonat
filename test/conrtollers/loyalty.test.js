process.env.NODE_ENV= 'test';
const chai= require('chai');
const chaiHttp=require('chai-http');
const app = require('../../server');
const sinon = require("sinon");
// const assert = chai.assert;
const mocks =require('../mocks')
chai.use(chaiHttp);
chai.should()


describe('testing GET/statistics',()=>{
        
    //test get/statistics
    // return array
    it('should return an object containing gifts statistics ',(done)=>{
    
     
      let res ={
          send:sinon.spy(),
          status:sinon.spy()
      }
      mocks.mockAddingLoyaltyProgoram(req,res)
      res.send.calledOnce.should.equal(true)
            done()
       
    });

    })
