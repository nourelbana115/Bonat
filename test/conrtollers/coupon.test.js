process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../server');
// const assert = chai.assert;
chai.use(chaiHttp);
chai.should()
describe('testing coupon routes', () => {
    let outsideToken;
    let insideToken;

    // auth :
    //first we get outside token
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

    // then get our token
    describe('Second step of getting authenticated', () => {
        // then get our token
        it('should give us an token', (done) => {
            chai.request(app)
                .post(`${process.env.TESTING_ROUTE}info`)
                .send({
                    "idMerchant": "1003",
                    "name": "ibrahim2",
                    "email": "ibrahim2@gmail.com",
                    "merchantImageUrl": "https://www.google.com/",
                    "phoneNumber": "01234567890",
                    "link": "",
                    "baseVisit": "",
                    "token": outsideToken

                })
                .end((err, res) => {
                    if (err) done(err);

                    insideToken = res.body.ourToken;
                    done()

                });
        });

    });

    // start testing routes

    describe('testing GET / LIST', () => {
        it('should return an array with all coupons ', (done) => {
            chai.request(app)
                .get(`${process.env.TESTING_ROUTE}coupon/list`)
                .set('Content-type', 'application/json')
                .set('x-auth', insideToken)
                .set('outSideToken', outsideToken)
                .end((err, res) => {
                    if (err) done(err);
                    // console.log(res.error)
                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.body.should.be.a('array');
                    res.error.should.equal(false);
                    res.body.forEach(e => {
                        e.should.include.keys("_id", "idMerchant", "title", "title_ar", "createdAt", "dashboardData", "description", "discount", "expirationDate", "idCampaign", "idCampaignType", "idCity", "imageUrl", "startDate", "status", "is_reward", "latestUpdate", "maxOwner", "newPrice", "numAvailable", "numOfValidDays", "oldPrice", "scheduled");

                        e.idMerchant.should.be.a('string')
                        e.title.should.be.a('string')
                        e.title_ar.should.be.a('string')
                        e.createdAt.should.be.a('string') //ask here 
                        e.startDate.should.be.a('string') //ask here  
                        e.dashboardData.should.be.a('string')//ask here 
                        e.idMerchant.should.be.a('string')
                        e.description.should.be.a('string')
                        e.discount.should.be.a('string')
                        e.expirationDate.should.be.a('string')//ask here             
                        e.idCampaign.should.be.a('string')
                        e.idCampaignType.should.be.a('string')
                        e.idCity.should.be.a('number')
                        e.imageUrl.should.be.a('array')
                        // e.is_active.should.be.a('boolean')
                        // e.is_drafted.should.be.a('boolean')
                        e.status.should.be.a('string')
                        e.is_reward.should.be.a('boolean')
                        e.latestUpdate.should.be.a('string')
                        e.maxOwner.should.be.a('number')
                        e.newPrice.should.be.a('string')
                        e.numAvailable.should.be.a('number')
                        e.numOfValidDays.should.be.a('number')
                        e.oldPrice.should.be.a('string')
                        e.scheduled.should.be.a('boolean')


                    });
                    done()
                });
        });
    });
    // make sure to change the title in .send before each test
    describe('testing POST / Coupon /ADD ',()=>{
        it('should add a new coupon and return an object of it ', (done)=>{
            chai.request(app)
            .post(`${process.env.TESTING_ROUTE}coupon/add`)
            .set('Content-type','application/json')
            .set('x-auth',insideToken)
            .set('outSideToken',outsideToken)
            .send({
                    "title": "tes3333t add cpon 01 ",
                    "title_ar": "30% Discount of your next Tea",
                    "description": "Enjoy our highend made tea with lemon.",
                    "description_ar": "Enjoy our highend made tea with lemon.",
                    "oldPrice": 20.12,
                    "newPrice": 15,
                    "startDate": "2019-12-19",
                    "expirationDate": "2020-06-18",
                    "numAvailable": 1000,
                    "is_active": false,
                    "is_drafted": true,
                    "status":'drafted',
                    "imageUrl": [
                        "https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/52816a54-aae6-4919-a032-152b4f45e2e3.jpg"
                    ],
                    "idCity": 1,
                    "idCampaignType": 2,
                    "maxOwner": 4,
                    "numOfValidDays": 80,
                    "dashboardData": "{a:2}",
                    "is_reward": "true",
                    "discount": 20,
                    "coverImageUrl": "https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/52816a54-aae6-4919-a032-152b4f45e2e3.jpg"

            })
            .end((err,res)=>{
                if(err) done(err);
                res.should.have.status(200);
                res.type.should.equal('application/json');
                res.body.should.be.a('object');
                res.error.should.equal(false);
                res.body.newCoupons.should.include.keys("imageUrl",
                "_id",
                "idMerchant",
                "title",
                "title_ar",
                "description",
                "oldPrice",
                "newPrice",
                "is_reward",
                "numAvailable",
                "idCity",
                "idCampaignType",
                "maxOwner",
                "numOfValidDays",
                "dashboardData",
                "status",
                "discount",
                "startDate",
                "expirationDate",
                "latestUpdate",
                "createdAt",
                "idCampaign",)
                res.body.newCoupons.idMerchant.should.be.a('string')             
                res.body.newCoupons.title.should.be.a('string')             
                res.body.newCoupons.title_ar.should.be.a('string')             
                res.body.newCoupons.createdAt.should.be.a('string') //ask here 
                res.body.newCoupons.startDate.should.be.a('string') //ask here  
                res.body.newCoupons.status.should.eql('drafted') //ask here  
                res.body.newCoupons.dashboardData.should.be.a('string')//ask here 
                res.body.newCoupons.idMerchant.should.be.a('string')             
                res.body.newCoupons.description.should.be.a('string')             
                res.body.newCoupons.discount.should.be.a('string')             
                res.body.newCoupons.expirationDate.should.be.a('string')//ask here             
                res.body.newCoupons.idCampaign.should.be.a('string')             
                res.body.newCoupons.idCity.should.be.a('number')             
                res.body.newCoupons.idCampaignType.should.be.a('string')             
                res.body.newCoupons.imageUrl.should.be.a('array') 
                // res.body.is_active.should.be.a('boolean')
                // res.body.is_drafted.should.be.a('boolean')
                res.body.newCoupons.is_reward.should.be.a('boolean')
                res.body.newCoupons.latestUpdate.should.be.a('string')             
                res.body.newCoupons.maxOwner.should.be.a('number')             
                res.body.newCoupons.newPrice.should.be.a('string')         
                res.body.newCoupons.numAvailable.should.be.a('number') 
                res.body.newCoupons.numOfValidDays.should.be.a('number')             
                res.body.newCoupons.oldPrice.should.be.a('string')
                done()
            })
        })
    });

    describe('testing  POST / COUPON /EDIT', () => {
        it('should edit and return a success message', (done) => {
            const idToEdit = 'f84804d0-fccf-11e9-8dc3-d97cdc05fea3';
            chai.request(app)
                .post(`${process.env.TESTING_ROUTE}coupon/edit?idCampaign=${idToEdit}`)
                .set('Content-type', 'application/json')
                .set('x-auth', insideToken)
                .set('outSideToken', outsideToken)
                .send({
                    "title": "Discount of 123 water",
                    "title_ar": "30% Discount of your next Tea",
                    "description": "Enjoy our highend made tea with lemon.",
                    "description_ar": "Enjoy our highend made tea with lemon.",
                    "oldPrice": 20.12,
                    "newPrice": 15,
                    "startDate": "2019/12/19",
                    "expirationDate": "2020/1/18",
                    "numAvailable": 1000,
                    "status": 'active',
                    "imageUrl": [
                        "https://scm-assets.constant.co/scm/unilever/a6798e909fa57bfd19c3e7f00737e5d6/52816a54-aae6-4919-a032-152b4f45e2e3.jpg"
                    ],
                    "idCity": 1,
                    "idCampaignType": 2,
                    "maxOwner": 4,
                    "numOfValidDays": 80,
                    "dashboardData": "{a:2}",
                    "is_reward": "true",
                    "discount": 20

                })
                .end((err, res) => {
                    if (err) done(err);

                    res.should.have.status(200);
                    res.type.should.equal('application/json');
                    res.error.should.equal(false);
                    res.body.should.be.a('object');
                    res.body.should.have.property("message").eql(`Coupon with id : ${idToEdit} has been updated successfully.`)

                    done()

                })
        })
    });
    //make sure to change the idCoupon before testing 
    // describe('testing POST/ COUPON /UNPUBLISH',()=>{
    //     it('should unpublish and return object of {"code","data", "errors","debugError"}',(done)=>{
    //         let idCoupon='f84804d0-fccf-11e9-8dc3-d97cdc05fea3'; 
    //         chai.request(app)
    //         .post(`${process.env.TESTING_ROUTE}coupon/${idCoupon}/unpublish`)
    //         .set('Content-type','application/json')
    //         .set('x-auth',insideToken)
    //         .set('outSideToken',outsideToken)
    //         .end((err,res)=>{

    //             if(err) done(err);

    //             res.should.have.status(200)
    //             res.body.should.be.a('object')
    //             res.type.should.equal('application/json');
    //             res.error.should.equal(false);
    //             res.body.should.include.keys("code","data", "errors","debugError")
    //             res.body.code.should.be.a('number').eql(0)
    //             res.body.data.should.be.a('string').eql('Campaign unpublished successfully')
    //             res.body.errors.should.be.a('array').length(0);
    //             res.body.debugError.should.be.a('string')



    //             done()

    //         })
    //     })
    // });

    // describe('testing GET / statistics',()=>{
    //     it('should return an array containing coupons statistics',(done)=>{
    //         chai.request(app)
    //         .get(`${process.env.TESTING_ROUTE}coupon/statistics`)
    //         .set('Content-type','application/json')
    //         .set('x-auth',insideToken)
    //         .set('outSideToken',outsideToken)
    //         .end((err,res)=>{

    //             if(err) done(err);
    //             // console.log(res.error)
    //             res.should.have.status(200);
    //             res.type.should.equal('application/json');
    //             res.body.should.be.a('array');
    //             res.error.should.equal(false);
    //             res.body.forEach( e => {
    //             e.should.include.keys(
    //                 "idCampaign","idMerchant","createdAt","initialPrice",
    //                 "newPrice","discount","customerPerCoupon","activeAfterPurchased"
    //                 ,"expirationDate", "leftCoupons","purchasedCoupons",
    //                 "couponsAmount","usedCoupons","validCoupons","expiredCoupons","isActive","lastUpdate"
    //             )           
    //             e.idCampaign.should.be.a('string') 
    //             e.idMerchant.should.be.a('number')  
    //             e.createdAt.should.be.a('string') //ask here 
    //             e.initialPrice.should.be.a('string')  
    //             e.newPrice.should.be.a('string') 
    //             e.discount.should.be.a('number') 
    //             e.customerPerCoupon.should.be.a('number')             
    //             e.activeAfterPurchased.should.be.a('number')             
    //             e.expirationDate.should.be.a('string')//ask here             
    //             e.leftCoupons.should.be.a('number')  
    //             e.purchasedCoupons.should.be.a('number')  
    //             e.couponsAmount.should.be.a('number')  
    //             e.usedCoupons.should.be.a('number')  
    //             e.usedCoupons.should.be.a('number')  
    //             e.expiredCoupons.should.be.a('number')  
    //             e.isActive.should.be.a('boolean')
    //             e.lastUpdate.should.be.a('string')             
    //             });
    //             done()
    //         });
    //     });
    // });
    describe('testing GET / statistics /idCampaign', () => {
        it('should return an array containing coupons statistics', (done) => {
            let idCampaign = 'f84804d0-fccf-11e9-8dc3-d97cdc05fea3'
            chai.request(app)
                .get(`${process.env.TESTING_ROUTE}coupon/statistics/${idCampaign}`)
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
                    res.body.should.include.keys(
                        "idCampaign", "idMerchant", "createdAt", "initialPrice",
                        "newPrice", "discount", "customerPerCoupon", "activeAfterPurchased"
                        , "expirationDate", "leftCoupons", "purchasedCoupons",
                        "couponsAmount", "usedCoupons", "validCoupons", "expiredCoupons", "isActive", "lastUpdate"
                    )
                    res.body.idCampaign.should.be.a('string')
                    res.body.idMerchant.should.be.a('number')
                    res.body.createdAt.should.be.a('string') //ask here 
                    res.body.initialPrice.should.be.a('string')
                    res.body.newPrice.should.be.a('string')
                    res.body.discount.should.be.a('number')
                    res.body.customerPerCoupon.should.be.a('number')
                    res.body.activeAfterPurchased.should.be.a('number')
                    res.body.expirationDate.should.be.a('string')//ask here             
                    res.body.leftCoupons.should.be.a('number')
                    res.body.purchasedCoupons.should.be.a('number')
                    res.body.couponsAmount.should.be.a('number')
                    res.body.usedCoupons.should.be.a('number')
                    res.body.usedCoupons.should.be.a('number')
                    res.body.expiredCoupons.should.be.a('number')
                    res.body.isActive.should.be.a('boolean')
                    res.body.lastUpdate.should.be.a('string')

                    done()
                });
        });
    });
});