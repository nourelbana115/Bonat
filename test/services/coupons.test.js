process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
// const assert = chai.assert;
chai.use(chaiHttp);
chai.should()

const { Coupons } = require('../../db/models/Coupons');
const couponsServices = require('../../services/mainBackendServices/couponServices')

describe('Testing coupons services', () => {

  before(async () => {
    const couponData = {
      "title": "test history coupon",
      "title_ar": "30% Discount of your next Tea",
      "idMerchant": "1003",
      "description": "Enjoy our highend made tea with lemon.",
      "description_ar": "Enjoy our highend made tea with lemon.",
      "oldPrice": 20.12,
      "newPrice": 15,
      "startDate": "2019-05-19",
      "expirationDate": new Date(),
      "numAvailable": 1000,
      "is_active": true,
      "is_drafted": false,
      "status": 'active',
      "idCampaign": "testHistoryCoupon",
      "imageUrl": [
        "https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/52816a54-aae6-4919-a032-152b4f45e2e3.jpg"
      ],
      "idCity": 1,
      "idCampaignType": 2,
      "maxOwner": 4,
      "numOfValidDays": 80,
      "dashboardData": "{a:2}",
      "is_reward": true,
      "discount": 20,
      "coverImageUrl": "https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/52816a54-aae6-4919-a032-152b4f45e2e3.jpg",
      "createdAt": "2019-06-18T17:17:15.298Z",
      "latestUpdate": "2019-06-18T17:17:15.298Z"
    }
    const newCoupon = new Coupons(couponData)
    newCoupon.save();
  })

  describe('Testing history coupons process', () => {
    it('should turn coupon status to history', async () => {
      const oldCoupons = await Coupons.find({ idCampaign: "testHistoryCoupon" });
      const expiredCoupons = couponsServices.couponToBeUpdated(oldCoupons)
      const updatedCoupons = await couponsServices.changeCouponsToHistory(expiredCoupons)

      updatedCoupons.forEach(e => {
        e.is_active.should.equal(false)
        e.is_drafted.should.equal(false)
      })
    })
  })

  after(async () => {
    const oldCoupons = await Coupons.deleteMany({ idCampaign: "testHistoryCoupon" });
  })
})