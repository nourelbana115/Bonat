process.env.NODE_ENV= 'test';
const chai= require('chai');
const chaiHttp=require('chai-http');
const app = require('../../server');
const giftServices = require('../../services/mainBackendServices/giftsServices')
const giftController = require('../../controllers/giftsController')
const run = require('../../services/QueuingServices/Jobs/sendAllCustomersGiftDailyJob')
const { Merchant } = require('../../db/models/merchant');
const giftMock = require('../mocks/giftMocks')
// const assert = chai.assert;
chai.use(chaiHttp);
chai.should()


const testData = async () =>{
    const merchant = [{idMerchant:1003, name:"fyoz", email:"ibrhaim2@gmail.com", phoneNumber:"010101010101",
  token:'08cd7c6278851244fc5f1732e10b8e02a7e9c204e21182c293b8932de6b160434906de4ba3a4dee1ad3fcda0fc19d706193943679d235403dabc4544943047e0'
  ,merchantImageUrl:'google.com'
  }]
    const createdMerchant = await Merchant.insertMany(merchant)
    return createdMerchant
  }
describe('testing gifts routes',()=>{
    // let outsideToken;
    // let insideToken;
    let merchant,gift;
    before((done)=>{
      testData().then(response =>{
        // console.log(response)
        merchant = response
        done()
      })
    });
     // auth :
    //first we get outside token
    // before((done)=>{
    //     chai.request(`${process.env.MAIN_BACKEND_API}login`)
    //     .post('/')
    //     .send({
    //         "email":"ibrahim2@gmail.com",
    //         "password":"Ibranhim@1234"
    //     })
    //     .end((err,res)=>{
    //         if(err) done(err);
    //         outsideToken = res.body.data.token;
    //         done()
        
    //     });
        
    // });
    // describe('Second step of getting authenticated',()=>{
    // // then get our token
    // it('should give us an token',(done)=>{
    //     chai.request(app)
    //         .post(`${process.env.TESTING_ROUTE}info`)            
    //         .send({
    //             "idMerchant": "1003",
    //             "name": "ibrahim2",
    //             "email": "ibrahim2@gmail.com",
    //             "merchantImageUrl": "https://www.google.com/",
    //             "phoneNumber": "01234567890",
    //             "link":"",
    //             "baseVisit": "",
    //             "token":outsideToken
            
    //         })
    //         .end((err,res)=>{
                
    //             if(err) done(err);
                
    //             insideToken = res.body.ourToken;
    //             done()
            
    //         });
    // });

    // })

    // describe('testing GET/statistics',()=>{
           
    // it('should return an object containing gifts statistics ',(done)=>{
    //     let giftId = '5dbabf1f81b03e163cb3993f';
    //     chai.request(app)
    //     .get(`${process.env.TESTING_ROUTE}gift/statistics/${giftId}`)
    //     .set('Content-type','application/json')
    //     .set('x-auth',insideToken)
    //     .set('outSideToken',outsideToken)
    //     .end((err,res)=>{
    //         if(err) done(err);
    //         res.should.have.status(200);
    //         res.type.should.equal('application/json');
    //         res.body.should.be.a('object');
    //         res.error.should.equal(false);
    //         res.body.data.GiftStatistics.should.include.keys(
    //             "_id",
    //             "gift",
    //             "amountOfSentGifts",
    //             "amountOfUsedGifts",
    //             "percentageOfUsage",
    //             "createdAt"
    //             )
    //         res.body.data.GiftStatistics._id.should.be.a('string')             
    //         res.body.data.GiftStatistics.gift.should.be.a('string')        
    //         res.body.data.GiftStatistics.createdAt.should.be.a('string')              
    //         res.body.data.GiftStatistics.amountOfSentGifts.should.be.a('number')             
    //         res.body.data.GiftStatistics.amountOfUsedGifts.should.be.a('number')             
    //         res.body.data.GiftStatistics.percentageOfUsage.should.be.a('number')             

    //         done()
    //     })
    // });

    // it('should return an object containing gifts statistics ',(done)=>{
    //     chai.request(app)
    //     .get(`${process.env.TESTING_ROUTE}gift/statistics`)
    //     .set('Content-type','application/json')
    //     .set('x-auth',insideToken)
    //     .set('outSideToken',outsideToken)
    //     .end((err,res)=>{
    //         if(err) done(err);
    //         res.should.have.status(200);
    //         res.type.should.equal('application/json');
    //         res.body.should.be.a('object');
    //         res.error.should.equal(false);
    //         res.body.data.GiftsStatistics.forEach( e => {
    //             e.should.include.keys(
    //             "_id",
    //             "gift",
    //             "amountOfSentGifts",
    //             "amountOfUsedGifts",
    //             "percentageOfUsage",
    //             "createdAt"
    //             )
    //             e._id.should.be.a('string')             
    //             e.gift.should.be.a('object')        
    //             e.createdAt.should.be.a('string')              
    //             e.amountOfSentGifts.should.be.a('number')             
    //             e.amountOfUsedGifts.should.be.a('number')             
    //             e.percentageOfUsage.should.be.a('number')  
    //         })
                    

    //         done()
    //     })
    // });

    // })

    describe('testing GET/list',()=>{ 
        
        //test get/list
        it('should return an array with all gifts',(done)=>{
           giftController.getAllGifts(req,res)
           .then(res=>{
            res.body.data.gifts.forEach( e => {
                e.should.include.keys(
                    "_id",
                    "merchant",
                    "title",
                    "description",
                    "numOfValidDays",
                    "imageUrl",
                    "dashboardData",
                    "createdAt",
                    "updatedAt",
                    "status_label",
                    "idCampaignType",
                    "status",
                    "segment",
                    );
                e._id.should.be.a('string')             
                e.merchant.should.be.a('string')             
                e.title.should.be.a('string')             
                e.description.should.be.a('string')             
                e.numOfValidDays.should.be.a('number')  
                e.imageUrl.should.be.a('array') 
                e.dashboardData.should.be.a('string')//ask here 
                e.createdAt.should.be.a('string') //ask here 
                e.status.should.be.a('string')
                e.idCampaignType.should.be.a('number')
                e.segment.should.not.be.empty
                e.updatedAt.should.be.a('string') //ask here 
                done()
                })
    
            })
        })
    })
   
    describe('testing GET/list-active',()=>{

         //test get/list-active
        it('should return all active lists ',(done)=>{
            const req ={
                merchant:merchant[0],
            }
            const res = {
                send:sinon.spy()
            }
            giftController.getActiveGifts(req,res)
            .then(res=>{
                res.body.data.gifts.forEach( e => {
                    e.should.include.keys(
                        "_id",
                        "merchant",
                        "title",
                        "description",
                        "numOfValidDays",
                        "imageUrl",
                        "dashboardData",
                        "createdAt",
                        "updatedAt",
                        "status_label",
                        "idCampaignType",
                        "status",
                        "segment",
                        );
                    e._id.should.be.a('string')             
                    e.merchant.should.be.a('string')             
                    e.title.should.be.a('string')             
                    e.description.should.be.a('string')             
                    e.numOfValidDays.should.be.a('number')  
                    e.imageUrl.should.be.a('array') 
                    e.dashboardData.should.be.a('string')//ask here 
                    e.createdAt.should.be.a('string') //ask here 
                    e.status.should.be.a('string')
                    e.idCampaignType.should.be.a('number')
                    e.segment.should.not.be.empty
                    e.updatedAt.should.be.a('string') //ask here 

                    done()
                })
            })
        })
    })

    describe('testing POST/publish',()=>{

        //test post/publish 
        it('should publish drafted gift and return an message ',async()=>{
            const createGift = sinon.fake.returns(giftMock.createGift)
            
            const giftWihtIdCamp = await createGift(gift)
            
            const activeGift = await giftServices.updateGiftDoc(
                {_id:gift._id},
                {
                    $set:{
                        idCampaign:giftWihtIdCamp.idCampaign,
                        status:'active',
                        updatedAt: new Date()
                    }
                }
            );
            let checkOnGift = await giftServices.findById(gift._id)
            checkOnGift.should.include.keys(
                    "_id",
                    "merchant",
                    "title",
                    "description",
                    "idCampaign",
                    "numOfValidDays",
                    "imageUrl",
                    "dashboardData",
                    "createdAt",
                    "updatedAt",
                    "status_label",
                    "status",
                    "segment",
                    "sendDate");
           
                    checkOnGift.status.should.eql('active')
                    checkOnGift.idCampaign.should.be.a('string')

            })
    })
   
    describe('testing POST/unpublish',()=>{
        //test post/unpublish 
        it('it should unpublish and return the unpublished gift ',(done)=>{
            const req ={
                merchant:merchant[0],
                body:{
                    _id:gift._id
                }
            }
            const res={
                send:sinon.spy()
            }
            giftController.unpublishGifts(req,res)
            .then(res=>{
                res.should.have.status(200);
                res.type.should.equal('application/json');
                res.body.data.gift.should.be.a('object');
                res.error.should.equal(false);
                res.body.data.gift.should.include.keys(
                        "_id",
                        "merchant",
                        "title",
                        "description",
                        "idCampaign",
                        "numOfValidDays",
                        "imageUrl",
                        "dashboardData",
                        "createdAt",
                        "updatedAt",
                        "status_label",
                        "status",
                        "segment",
                        "sendDate");
                    res.body.data.gift._id.should.be.a('string')             
                    res.body.data.gift.merchant.should.be.a('string')             
                    res.body.data.gift.status_label.should.exists()  
                    res.body.data.gift.title.should.be.a('string')             
                    res.body.data.gift.description.should.be.a('string')             
                    res.body.data.gift.numOfValidDays.should.be.a('number')  
                    res.body.data.gift.imageUrl.should.be.a('array') 
                    res.body.data.gift.dashboardData.should.be.a('string')//ask here 
                    res.body.data.gift.createdAt.should.be.a('string') //ask here 
                    res.body.data.gift.status.should.eql('history')
                    res.body.data.gift.idCampaign.should.be.a('string')
                    res.body.data.gift.segment.should.not.be.empty
                    res.body.data.gift.sendDate.should.be.a('string') //ask here 
                    res.body.data.gift.updatedAt.should.be.a('string') //ask here 
               
                done()
            })
               
            
        })
    })

    describe('testing POST/add',()=>{

        //test post/add 
        it('should add a new gift and return an object of it',(done)=>{
            const req={
                merchant:merchant[0],
                body:{"title": "this is a new gift",
                "title_ar": "استمتع بالمذاق",
                "description": "This a free coffe under the condition thaat you drink black!!",
                "description_ar": "30? خصم",
                "discount":100,
                "numOfValidDays": 30,
                "imageUrl": ["http://18.223.3.68:3001/api/v2/image/1568252383788"],
                "dashboardData": {},
                "status":"drafted",
                "segment":{
                    "name":"everyone",
                    "options":{
                       "id":"send_after_publishing",
                       "sendDate":null
                     }
                   }}
            }
            const res ={
                send:sinon.spy()
            }
            giftController.addGift(req,res)
            .then(res=>{
                gift = res.body.data.gift
                res.body.data.gift.should.include.keys( 
                    "imageUrl",
                    "receivedCustomers",
                    "_id" ,
                    "title",
                    "title_ar",
                    "description",
                    "description_ar",
                    "numOfValidDays",
                    "status",
                    "discount",
                    "dashboardData",
                    "segment",
                    "sendDate",
                    "giftSegmentId",
                    "idCampaignType",
                    "createdAt",
                    "expirationDate",
                    "updatedAt",
                    "merchant",
                    "idCampaign",
                    "__v")  ;
                   res.body.data.gift.imageUrl.should.be.a('array') 
                   res.body.data.gift.receivedCustomers.should.be.a('array') 
                   res.body.data.gift._id.should.be.a('string')             
                   res.body.data.gift.title.should.be.a('string')             
                   res.body.data.gift.title_ar.should.be.a('string')             
                   res.body.data.gift.description.should.be.a('string')             
                   res.body.data.gift.description_ar.should.be.a('string')             
                   res.body.data.gift.numOfValidDays.should.be.a('number')  
                   res.body.data.gift.status.should.be.a('string')
                   res.body.data.gift.discount.should.be.a('number')
                   res.body.data.gift.dashboardData.should.be.a('string')//ask here 
                   res.body.data.gift.segment.should.be.a('string')
                   res.body.data.gift.sendDate.should.be.a('string') //ask here 
                   res.body.data.gift.updatedAt.should.be.a('string') //ask here 
                   res.body.data.gift.idCampaignType.should.be.a('number')         
                   res.body.data.gift.createdAt.should.be.a('string') //ask here 
                   res.body.data.gift.merchant.should.be.a('string')  
                   res.body.data.gift.idCampaign.should.be.a('string')         
                    
    
                done()

            })
                
                })
    })

    describe('testing POST/create-custom-gift',()=>{
            //test post/create-custom-gift 
        it('should add a new gift with a specified cust and return an object of it',(done)=>{
            const req ={
                merchant:merchant[0],
                body:{
                "title": "this is a new gift",
                "title_ar": "استمتع بالمذاق",
                "description": "This a free coffe under the condition thaat you drink black!!",
                "description_ar": "30? خصم",
                "status":"drafted",
                "discount":100,
                "numOfValidDays": 30,
                "imageUrl": ["http://18.223.3.68:3001/api/v2/image/1568252383788"],
                "dashboardData": {},
               "customers":["5d8bf1e60b2d32406468ba5c","5d8bf1e60b2d32406468ba5f" ]
                }
            }
            const res = {
                send:sinon.spy()
            }
            giftController.customGifts(req,res)
            .then(res=>{
                res.body.data.gift.should.include.keys( 
                    "imageUrl",
                    "receivedCustomers",
                    "_id" ,
                    "title",
                    "title_ar",
                    "description",
                    "description_ar",
                    "numOfValidDays",
                    "status",
                    "discount",
                    "dashboardData",
                    "segment",
                    "sendDate",
                    "giftSegmentId",
                    "idCampaignType",
                    "createdAt",
                    "expirationDate",
                    "updatedAt",
                    "merchant",
                    "idCampaign",
                    )  ;
                   res.body.data.gift.imageUrl.should.be.a('array') 
                   res.body.data.gift.receivedCustomers.should.be.a('array') 
                   res.body.data.gift._id.should.be.a('string')             
                   res.body.data.gift.title.should.be.a('string')             
                   res.body.data.gift.title_ar.should.be.a('string')             
                   res.body.data.gift.description.should.be.a('string')             
                   res.body.data.gift.description_ar.should.be.a('string')             
                   res.body.data.gift.numOfValidDays.should.be.a('number')  
                   res.body.data.gift.status.should.be.a('string')
                   res.body.data.gift.discount.should.be.a('number')
                   res.body.data.gift.dashboardData.should.be.a('string')//ask here 
                   res.body.data.gift.segment.should.be.a('string')
                   res.body.data.gift.sendDate.should.be.a('string') //ask here 
                   res.body.data.gift.updatedAt.should.be.a('string') //ask here 
                   res.body.data.gift.idCampaignType.should.be.a('number')         
                   res.body.data.gift.createdAt.should.be.a('string') //ask here 
                   res.body.data.gift.merchant.should.be.a('string')  
                   res.body.data.gift.idCampaign.should.be.a('string') 
                done()
            
            })
                   
        })
    })
    
    describe('finding merchant gifts',()=>{
            //test post/create-custom-gift 
        it('should return only merchat gifts',(done)=>{
            const query = {merchant:merchant[0]._id}
           giftServices.findFromGiftModel(query)
           .then(result =>{
               result.length.should.equal(1)
               done()
           })
        })
        it('should return no gifts',(done)=>{
            const query = {merchant:'5ddb4e60707da30a60302381'}
           giftServices.findFromGiftModel(query)
           .then(result =>{
               result.length.should.equal(0)
               done()
           })
        })
    })
    describe('sending everyone with a merchant does not have any customers',()=>{
        //test post/create-custom-gift 
    it('should return no customers',(done)=>{
      run({giftId:gift._id})
      .then(gift =>{
          gift.should.equal('no customers')
          done()
      })
    })
})
    
})