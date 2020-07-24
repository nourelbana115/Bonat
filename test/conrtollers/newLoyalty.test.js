process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
const sinon = require("sinon");
// const assert = chai.assert;
const { Merchant } = require('../../db/models/merchant');
const { LoyaltyPrograms } = require('../../db/models/LoyaltyPrograms');

chai.use(chaiHttp);
chai.should()


describe('testing new loyalty routes', () => {
  let insideToken;

  before(async () => {
    const merchantData = {
      idMerchant: "testIdMerchantForTests", name: "test", email: "test@test.com", phoneNumber: "010101010101",
      token: 'testTokenForTests', merchantImageUrl: 'google.com', idLoyaltyType: 2
    }
    const createdMerchant = new Merchant(merchantData)
    createdMerchant.save()

    const programData = {
      "idMerchant": "testIdMerchantForTests",
      "title": "test_3",
      "title_ar": "شاهي عسل بلاش",
      "description": "Enjoy our highend made tea with honey",
      "description_ar": "استمتع بذوقك الرفيع احلى شاهي عسل",
      "numOfValidDays": 30,
      "idCampaignType": 7,
      "posIdProduct": 123,
      "coverImageUrl": "https://png.pngtree.com/element_origin_min_pic/16/11/25/0c8eeb88b2492b4895cddf7d4fa98acf.jpg",
      "imageUrl": [
        "https://foodsogoodmall.com/wp-content/uploads/2013/09/Orange-and-Mint-Green-Ice-Tea.jpg"
      ],
      "dashboardData": "\"\\\"{\\\\\\\"itemName\\\\\\\": \\\\\\\"test\\\\\\\", \\\\\\\"itemDescription\\\\\\\": \\\\\\\"YYYY\\\\\\\"}\\\"\"",
      "merchant": "5dee8dd70efcc5227803ff82",
      "createdAt": "2019-12-10T21:24:23.673Z",
      "latestUpdate": "2019-12-10T21:24:23.673Z",
      "pointValue": 120,
      "is_active": true,
      "is_drafted": false,
      "idCampaign": "testIdCampaignTest"
    };
    const newProgram = new LoyaltyPrograms(programData)
    newProgram.save();
  });

  describe('Second step of getting authenticated', () => {
    // then get our token
    it('should give us an token', async () => {
      const res = await chai.request(app)
        .post(`${process.env.TESTING_ROUTE}info`)
        .send({
          "idMerchant": "testIdMerchantForTests",
          "token": 'testTokenForTests'
        })
      insideToken = res.body.ourToken;
    });
  });

  describe('testing GET /list', () => {
    it('should return an array of new loyalty programs', async () => {
      const res = await chai.request(app)
        .get(`${process.env.TESTING_ROUTE}program/list`)
        .set('Content-type', 'application/json')
        .set('x-auth', insideToken)
        .set('outSideToken', 'testTokenForTests')

      res.should.have.status(200);
      res.type.should.equal('application/json');
      res.body.should.be.a('array');
      res.error.should.equal(false);
      res.body.forEach(e => {
        e._id.should.be.a('string')
        e.idMerchant.should.be.a('string')
        e.idCampaign.should.be.a('string')
        e.title.should.be.a('string')
        e.title_ar.should.be.a('string')
        e.description.should.be.a('string')
        e.description_ar.should.be.a('string')
        e.numOfValidDays.should.be.a('number')
        e.idCampaignType.should.be.a('number')
        e.posIdProduct.should.be.a('number')
        e.coverImageUrl.should.a('string')
        e.dashboardData.should.be.a('string')
        e.imageUrl.should.be.a('array')
        e.merchant.should.be.a('string')
        e.createdAt.should.be.a('string')
        e.latestUpdate.should.be.a('string')
        e.pointValue.should.be.a('number')
        e.status.should.be.a('string')
        e.pending.should.be.a('boolean')
      });
    });
  });

  after(async () => {
    const oldPrograms = await LoyaltyPrograms.deleteMany({ idMerchant: "testIdMerchantForTests" });
    const oldMerchants = await Merchant.deleteMany({ idMerchant: "testIdMerchantForTests" });
  })
});
