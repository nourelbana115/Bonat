process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should();
const segmentsServices = require('../../services/mainBackendServices/segmentsServices')

const customersMock = require('../mocks/customersMock')
const sinon = require('sinon');

describe('Testing segments services', () => {

  describe('testing all customers segment calculation', () => {
    it('should calculate all customers segment correctly', (done) => {
      const req = {}
      const res = {
        send: sinon.spy()
      }

      customersMock.getMockedCustomers(req, res)

      res.send.calledOnce.should.equal(true)

      const allCustomers = segmentsServices.calculateAllCustomers(res.send.firstCall.lastArg).segmentData.allCustomers
      allCustomers.should.equal(38);
      done();
    })
  })

  describe('testing superFans segment calculation', () => {
    it('should calculate superFans segment correctly', (done) => {
      const req = {}
      const res = {
        send: sinon.spy()
      }

      customersMock.getMockedCustomers(req, res)

      res.send.calledOnce.should.equal(true)

      const SuperFsnCustomers = segmentsServices.calculateSuperFans(res.send.firstCall.lastArg).segmentData.mostActive

      SuperFsnCustomers.should.equal(6);

      done();
    })
  })

  describe('testing birthday segment calculation', () => {
    it('should calculate birthday segment correctly', (done) => {
      const req = {}
      const res = {
        send: sinon.spy()
      }

      customersMock.getMockedCustomers(req, res)

      res.send.calledOnce.should.equal(true)

      let today = new Date()

      var customers = JSON.parse(JSON.stringify(res.send.firstCall.lastArg))

      const listBirthdayCustomers = customers.slice(0, 4);
      const birthdayCustomers = listBirthdayCustomers.filter(customer => customer.birthday = today)

      const birthdayThisMonth = segmentsServices.calculateBirthDayCustomers(birthdayCustomers).segmentData.birthDayThisMonth
      const birthdayMentionedCustomers = segmentsServices.calculateBirthDayCustomers(res.send.firstCall.lastArg).segmentData.mentionedTheirBirthDay

      birthdayThisMonth.should.equal(4)
      birthdayMentionedCustomers.should.equal(16)

      done();
    })
  })

  describe('testing lostCustomers segment calculation', () => {
    it('should calculate lostCustomers segment correctly', (done) => {
      const req = {}
      const res = {
        send: sinon.spy()
      }

      customersMock.getMockedCustomers(req, res)

      res.send.calledOnce.should.equal(true)

      let today = new Date()

      const listNotLostCustomers = res.send.firstCall.lastArg.slice(7, 10)
      const notLostCustomers = listNotLostCustomers.filter(customer => customer.lastVisit = today).length

      const lostCustomers = segmentsServices.calculateLostCustomers(res.send.firstCall.lastArg).segmentData.zeroActivity

      lostCustomers.should.equal(res.send.firstCall.lastArg.length - notLostCustomers)

      done();
    })
  })

  describe('testing newCustomers segment calculation', () => {
    it('should calculate newCustomers segment correctly', (done) => {
      const req = {}
      const res = {
        send: sinon.spy()
      }

      customersMock.getMockedCustomers(req, res)

      res.send.calledOnce.should.equal(true)

      let today = new Date()
      let lastMonth = `${today.getFullYear()}-${(today.getMonth())}-${today.getDate()}`
 
      const listLastMonth = res.send.firstCall.lastArg.slice(0, 3)
      const lastMonthCustomers = listLastMonth.filter(customer => customer.createdAt = new Date(lastMonth))

      const listNewCustomers = res.send.firstCall.lastArg.slice(7, 10)
      const currentMonthCustomers = listNewCustomers.filter(customer => customer.createdAt = today)

      const createdThisMonth = segmentsServices.calculateNewCustomers(currentMonthCustomers).segmentData.createdThisMonth
      const createdLastMonth = segmentsServices.calculateNewCustomers(lastMonthCustomers).segmentData.createdLastMonth

      createdThisMonth.should.equal(3)
      createdLastMonth.should.equal(3)

      done();
    })
  })

})