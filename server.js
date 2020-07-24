require('./config/config');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
var cors = require('cors')
const axios = require('axios');
const express = require('express');
const path = require('path');

const queue = require('./services/QueuingServices/queue');
queue.worker.listen();

require('./db/seeds/index');

const cronJobServices = require('./services/cronJobServices');

cronJobServices.schedule();

// queue.publisher.dispatch('hello from new job');

//const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
const upload = require('./services/multer');
const singleUpload = upload.single('image');

const app = express();
app.use(bodyParser.json());


let { mongoose } = require('./db/mongoose');
let { Merchant } = require('./db/models/merchant');
let gifts = require('./routes/gifts');
let { authenticate } = require('./middleware/authenticate');
let coupons = require('./routes/coupons')
let loyaltyProgram = require('./routes/loyaltyProgram')
let segments = require('./routes/segments')
let customers = require('./routes/customers')
let sales = require('./routes/sales')
let merchant = require('./routes/merchant')
let ads = require('./routes/ads')
// const notifications = require('./routes/notifications')
const dashboard = require('./routes/dashboard')
const devices = require('./routes/devices')

const {apiRouter} = require('./routes/apiRouter');

const logger = require ('./services/logger');
const { DashboardBranchChart } = require('./db/models/DashboardBranchCharts');


const {generalResponse} = require('./requests/helpers/responseBody');

const { MobileMessage } = require('./db/models/MobileMessages');

// const bla = require('./services/QueuingServices/Jobs/saveDashboardInsightsJob')


app.get('/api/v2/testing', authenticate,(req, res) => {

  // queue.publisher.dispatch(
  //   {
  //     jobfile:"segmentsUpdateDailyJob",
  //     data:{}
  //   });

//   queue.publisher.dispatch(
       
//     {
//         jobfile:'saveReturnAndNewCustomersJob',
//         data:{} 
//     }
// );
  // queue.publisher.dispatch(
  //   {
  //     jobfile:"saveCouponStatsJob",
  //     data:{}
  // });

  // queue.publisher.dispatch(
  //   {
  //     jobfile:"updateMerchantDataJob",
  //     data:{}
  // });

//   DashboardBranchChart.find({})
//  .then((response) => {
      
      // res.send('1w')
    // })?
  
  // queue.publisher.dispatch(
  //   {
  //     jobfile:"saveDashboardChartJob",
  //     data:{}
  // });

  // queue.publisher.dispatch(
  //   {
  //     jobfile:"saveDashboardBranchChartJob",
  //     data:{}
  // });

  // queue.publisher.dispatch(
  //   {
  //     jobfile:"saveDashboardBranchInsightsJob",
  //     data:{}
  // });
  
  queue.publisher.dispatch(
    {
      jobfile:"saveGiftStatisticsToDbJob",
      data:{}
  });

  res.send('hi')

  // // sendMobileMessageJob
  // queue.publisher.dispatch(
  //   {
  //     jobfile:"segmentsUpdateDailyJob",
  //     data:{}
  //   });
  

    
    // const mobileMessage = new MobileMessage({
    //   segment: "5d8744d262f7af089e99bf1d",
    //   merchant:"5d27c9c6889a1272dc240327",
    //   messageContent: "hello from bonat api",
    //   isCustomSegment: true,
    //   dashboardData:{}
    // })
    
    // mobileMessage.save()
    // .then((response) => {
    //   queue.publisher.dispatch(
    //   {
    //     jobfile:"sendMobileMessageJob",
    //     data:{_id:response._id}
    //   });
    //   res.send(response)
    // })
    // .catch((err) => {
    //   logger.log('general', 'error', err, 'save MobileMessage')
    //   res.status(400).send(err)
    // })

      // bla()
      //   .then((response) => {
      //     res.send(response)
      //   })
      //   .catch((err) => {
      //     logger.log('general', 'error', err, 'save dashboard insights')
      //     res.status(400).send(err)
      //   })

  // const giftData = {
  //   merchant:"5d27c9c6889a1272dc240327",
  //   segment: "5d83974fcf697a7495776ab3",
  //   title: "test new",
  //   title_ar: "اختبار جديد",
  //   description: "gift decription",
  //   description_ar: "تفاصيل الهدية",
  //   numOfValidDays: 10,
  //   imageUrl: ["www.google.com"],
  //   idCampaignType:2,
  //   discount: 30,
  //   status:'created',
  //   dashboardData: JSON.stringify({}),
  //   createdAt: new Date(),
  //   updatedAt: new Date()
  // }

  // const newGift = new Gift(giftData);

  // newGift.save()

  // .then(gift => {

  //   queue.publisher.dispatch([
  //     {
  //       jobfile:"publishGiftOnBackendJob",
  //       data:{giftId:gift._id}
  //     },
  //     {
  //       jobfile:"testDependencyJob",
  //       data:{giftId:gift._id}
  //     }
  //   ]);
    
  //   res.send({gift:gift})
   
  // })

  // .catch(error => res.status(400).send(error))

  // segmentServices.createCustomSegment(req.merchant._id,["5d839768cf697a7495776ac7","5d839768cf697a7495776ac8"])

  // .then(segment =>res.send(segment))
   
  // .catch(error => res.status(400).send(error))
  
});

//--------------------------- start apis section ----------------------------
app.use(cors())

app.post('/createMerchant', (req, res) => {
  let body = _.pick(req.body, ['idMerchant', 'name', 'email', 'phoneNumber', 'merchantImageUrl'])
  let merchantData = new Merchant(body)
  merchantData.save().then((newMerchant) => {
    return res.send({ ...newMerchant._doc });
  }).catch((e) => {
    res.status(400).send(e);
  });
})

// var task = cron.schedule('* * * * *', () =>  {
//   console.log('stoped task');
// }, {
//   scheduled: false
// });

// task.start();

const biasApiRoute = "/api/";

const generateApiRoute = (route) => `${biasApiRoute}${route}`;

// merchant
app.use(generateApiRoute('merchant'), merchant)
// gifts
app.use(generateApiRoute('merchant/gift'), gifts)

// coupons
app.use(generateApiRoute('merchant/coupon'), coupons)

// loyalty programs
app.use(generateApiRoute('merchant/program'), loyaltyProgram)

// segments
app.use(generateApiRoute('merchant/segments'), segments)

// sales
app.use(generateApiRoute('merchant/sales'), sales)

// customers
app.use(generateApiRoute('merchant/customer'), customers)

// ads
app.use(generateApiRoute('merchant/ads'), ads)

// dashboard
app.use(generateApiRoute('merchant/dashboard'), dashboard)

// devices
app.use(generateApiRoute('merchant/devices'), devices)

// notifications
// app.use(generateApiRoute('merchant/notifications'), notifications)


//--- start get image link from s3
app.post(generateApiRoute('merchant/s3'), authenticate, (req, res) => {
  let body = _.pick(req.body, ['image']);
  let merchantData = req.merchant;
  singleUpload(req, res, function (err, some) {
    if (err) {
      logger.log('requests', 'error', err, 'Image Upload')
      console.log('ERRRRR', err)
      return res.status(422).send({ errors: [{ title: 'Image Upload Error', detail: err.message }] });
    }
    return res.json({ 'data': req.file });
  });
});
const aws = require('aws-sdk');
const s3 = new aws.S3();

app.get(generateApiRoute('image/:imageId'), function (req, res, next) {
  var params = { Bucket: process.env.AWS_S3_BUCKET, Key: req.params.imageId };
  s3.getObject(params, function (err, data) {
    if (err) {
      return res.send({ error: err });
    }
    //console.log('data', data)
    return res.send(data.Body);
  });
});

// handle 404 request 
app.get('*', (req, res) => res.status(404).send(generalResponse({},[],"this route is not exist")));

//serve the react app on some routes
// const buildPath = process.env.NODE_ENV == 'production'?'build-production':'build';

// app.use(express.static(path.resolve(__dirname,`../clientv2/${buildPath}`)));

// app.get('*', (req, res) => res.sendFile('index.html', {root: path.resolve(__dirname, '../clientv2/build/')}));

//--- end get image link from s3
//run the server 
const port = process.env.PORT;
const env = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development'
app.listen(port, () => {
  console.log(`Server is up on port ${port} in a (${env}) environment `);
});

module.exports=app;
