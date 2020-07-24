process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
chai.use(chaiHttp);
chai.should();
const dashboardServices = require('../../services/mainBackendServices/dashboardServices');

const sinon = require('sinon');
const customersMock = require('../mocks/customersMock');

function sum(arr) {
  let sum = 0;
  for (i of arr) {
    sum += Number(i);
  }
  return sum;
}


describe('testing dashboard services', () => {

  describe('testing visits per customers calculation', () => {
    it('should correctly calculate visits per customer', async () => {
      const req = {};
      const res = {
        send: sinon.spy()
      };

      customersMock.getMockedCustomers(req, res);

      res.send.calledOnce.should.equal(true);

      const chart = await dashboardServices.calculateVisits(res.send.firstCall.lastArg);

      chart.should.be.a('array');

      const visit1 = chart.filter(visits => visits.label === '1 visit')[0];
      const visit2 = chart.filter(visits => visits.label === '2-3 visits')[0];
      const visit4 = chart.filter(visits => visits.label === '4-7 visits')[0];
      const visit8 = chart.filter(visits => visits.label === '8-15 visits')[0];
      const visit16 = chart.filter(visits => visits.label === '16-25 visits')[0];
      const visit26 = chart.filter(visits => visits.label === '26-49 visits')[0];
      const visit50 = chart.filter(visits => visits.label === '+50 visits')[0];

      visit1.value.should.equal(21);
      visit2.value.should.equal(4);
      visit4.value.should.equal(3);
      visit8.value.should.equal(2);
      visit16.value.should.equal(2);
      visit26.value.should.equal(1);
      visit50.value.should.equal(5);

    });
  });

});
