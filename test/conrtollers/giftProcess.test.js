const chai= require('chai');
const chaiHttp=require('chai-http');
// const app = require('../../server');
// const {expect} = chai;
// const assert = chai.assert;
chai.use(chaiHttp);
chai.should()

const {giftProcess} = require('../../services/mainBackendServices/giftsServices');
describe('testing',()=>{
     
const req = {
    header:(outSideToken)=>{
        return '9eac3d42ca9119addd0d76906ff31780234cbada44c30be187284241fdbcfb7e70c93990df46774549ba90bde3907f9546b3800543e81cb862da889dee72b9af';
    },
    merchant:{
        idMerchant:'1003'
    }
}
const body ={
    "title": "this is a new gift",
    "title_ar": "استمتع بالمذاق",
    "description": "This a free coffe under the condition thaat you drink black!!",
    "description_ar": "٣٠٪ خصم",
    "numOfValidDays": 30,
    "type_en": "gift",
    "is_active": true,
    "is_drafted": false,
    "discount": 30,
    "imageUrl": [
        "www.gogole.com",
        "www.yahoo.com"
    ],
    "dashboardData": {},
    "giftCustomers": [
        1192,
        1231
    ]
}
let giftData = {
    title: body.title,
    title_ar: body.title_ar,
    description: body.description,
    description_ar: body.description_ar,
    numOfValidDays: body.numOfValidDays,
    imageUrl: body.imageUrl,
    is_active: body.is_active,
    is_drafted: body.is_drafted,
    discount: body.discount,
    giftCustomers: body.giftCustomers,
    dashboardData: JSON.stringify(body.dashboardData),
    segment: "customSegment",
    sendDate: new Date
}
let merchantData = req.merchant;
giftData.createdAt = new Date()
giftData.idMerchant = merchantData.idMerchant
customersIds = giftData.customersIds

let data = {
    idCampaign: giftData.idCampaign,
    cusotmers: giftData.giftCustomers
}
    // giftProcess(req, data, giftData).then((response) => {
    //     response.should
    // }).catch((err) => {
    //     console.log(err)
    // })
    it('should not creat a gift',(done)=>{
        giftData.idCampaign = "11"
       
         giftProcess(req, data, giftData).then((response) => {
            console.log(response)

        })
        .catch((err) => {
            console.log(typeof(err))
            err.should.be.a('array').contains('Missing idCampaign')
        done();

        })
    })
  
      
    })


