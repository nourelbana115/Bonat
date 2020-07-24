require('../config/config');
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
var router = express.Router();
const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
const upload = require('../services/multer');
const singleUpload = upload.single('image');
const logger = require('../services/logger');

let app = express();
app.use(bodyParser.json());

const mongo = require('mongodb').MongoClient
const dbUrl = 'mongodb://localhost:27017'

let { mongoose } = require('../db/mongoose');
let { Merchant } = require('../db/models/merchant');
let { Receipts } = require('../db/models/Receipts');
let { DailyAverageSales } = require('../db/models/DailyAverageSales');
let { Segments } = require('../db/models/Segments');
let { Coupons } = require('../db/models/Coupons');
let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
let { Gift } = require('../db/models/gifts');
let { CouponStatistics } = require('../db/models/couponStatistics');
let { statistics } = require('../db/models/statistics')
let { Ads } = require('../db/models/Ads');
let { authenticate } = require('../middleware/authenticate');



const DYM_dateForm = (date) => {
    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

router.get('/average' ,authenticate ,(req,res) => {
    let merchantData = req.merchant;
    DailyAverageSales.find({
        idMerchant: merchantData.idMerchant
    }).then((result) => {
            if(result.length === 0){
            //--- first time  
                requestDataRange("1990-01-01",DYM_dateForm(new Date),merchantData,req.header('outSideToken')).then((success)=>{
                    renderMonthData(merchantData).then((success)=>{
                        res.send(success);
                    },(err) => {
                        res.status(401).send(err);
                    });
                },(err) => {
                    res.status(401).send(err);
                });
            }
            else{
                //--- not first time
                //find last calculated day
                DailyAverageSales.find({
                    idMerchant: merchantData.idMerchant
                }).sort({"date" : -1})
                .limit(1).then((lastCalcDay) => {   
                    //last calc date
                    let lastCalcDate = new Date(lastCalcDay[0].date);
                    lastCalcDate.setDate(lastCalcDate.getDate()+1)
                    //current day date
                    let currentDate = new Date();
                    let currentDayStr = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate();
                    let currentDayDate = new Date(currentDayStr).toString();
                    
                    if(lastCalcDate == currentDayDate){
                        //current date is calculated
                        renderMonthData(merchantData).then((success)=>{
                            res.send(success);
                        },(err) => {
                            res.status(401).send(err);
                        });
                    }else{
                        //calculate the missing days and request it
                        currentDayDate = new Date(currentDayDate);
                        let startDay = lastCalcDate.getFullYear() + "-" + pad(lastCalcDate.getMonth() + 1) + "-" + pad(lastCalcDate.getDate());
                        let endDay = currentDayDate.getFullYear() + "-" + pad(currentDayDate.getMonth() + 1) + "-" + pad(currentDayDate.getDate());
                        requestDataRange(startDay,endDay,merchantData,req.header('outSideToken')).then((success)=>{
                            renderMonthData(merchantData).then((success)=>{
                                res.send(success);
                            },(err) => {
                                res.status(401).send(err);
                            });
                        },(err) => {
                            res.status(401).send(err);
                        });
                    }                    
                },(err) => {
                    res.status(400).send(err);
                });

            }
        },(err) => {
            res.status(400).send(err);
        }
    );
});
const requestDataRange = (start,end,merchantData,token) => {
    return new Promise(function(resolve, reject) {
        let url = `${process.env.MAIN_BACKEND_API}getMerchantRecipets`;
        let config ={
            headers: {
                "Authorization": "Bearer " + token
            },
            params: {
                starting_date: start,
                end_date: end
            }
        }
        axios.get(url, config)
        .then(response => {
            //calc average
            let salesAverageObject = calcSalesAverage(response.data, merchantData.idMerchant);
            let dataArr = [];
            for(let i = 0; i < salesAverageObject.length; i++){
                let currentObj = {
                    "idMerchant": merchantData.idMerchant,
                    "date": new Date(salesAverageObject[i].day),
                    "average": salesAverageObject[i].average,
                    "total": salesAverageObject[i].total,
                    "receiptsNumber": salesAverageObject[i].receiptsNumber,
                    "customerIds": salesAverageObject[i].customerIds
                }
                dataArr.push(currentObj);
            }
            if(dataArr.length === 0){
                resolve('Success!');
            }else{
                //save average data                
                mongo.connect(dbUrl, (err, client) => {
                    if (err) {
                        reject(err);
                        return
                    }
                    const db = client.db('Diario');
                    const collection = db.collection('dailyaveragesales');
                    collection.insert(dataArr, (err, result) => {
                        if (err) {
                            reject(err);
                            return
                        }
                        resolve('Success!');
                    })
                })
            }
        })
        .catch(error => {
            logger.log('requests', 'error', error, 'Request Data Range')
            reject(error);
        });
    });
}
const renderMonthData = (merchantData) => {  
    return new Promise(function(resolve, reject) {
        let currentDate = new Date();
        let currentYearStr = currentDate.getFullYear() + "-" + pad(currentDate.getMonth() + 1) + "-01";
        let currentYearDate = new Date(currentYearStr);
        //-- set default data
        let dailyData = [];
        let todayDate = new Date();
        let currentMonth = todayDate.getMonth() + 1;
        let monthDaysNum;
        if( currentMonth === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10 || currentMonth === 12){
            monthDaysNum = 31;
        }else if ( currentMonth === 2 ){
            monthDaysNum = 28;
        }else{
            monthDaysNum = 30;
        }
        for(let n = 1; n <= monthDaysNum; n++){
            dailyData.push({
                "day": todayDate.getFullYear() + "/" + currentMonth + "/" + n,
                "average": 0, 
                "total": 0, 
                "receiptsNumber": 0, 
                "customerIds": []
            });
        }
        DailyAverageSales.find({
            idMerchant: merchantData.idMerchant,
            date: { $gte: currentYearDate }
        }).sort({"date" : -1}).limit(40).then((result)=>{
            if(result.length === 0){
                resolve(dailyData);
            }else{
                for(let i = 0; i < result.length; i++){
                    if(todayDate.getFullYear() == new Date(result[i].date).getFullYear() && todayDate.getMonth() == new Date(result[i].date).getMonth()){
                        dailyData[new Date(result[i].date).getDate() - 1] = {
                            "day": DYM_dateForm(result[i].date), 
                            "average": result[i].average, 
                            "total": result[i].total, 
                            "receiptsNumber": result[i].receiptsNumber, 
                            "customerIds": result[i].customerIds
                        }
                    }
                }
                resolve(dailyData);
            }
        },(err) => {
            resolve(dailyData);
        });
    })
}
const calcSalesAverage = (salesObject, merchantId) => {
    let averageArr = [];
    for (var k in salesObject) {
        if (salesObject.hasOwnProperty(k)) {
           averageArr.push({"day": k, ...calcTotalReceipts(salesObject[k], merchantId)})
        }
    }
    return averageArr
}
const calcTotalReceipts = (receiptsArr, merchantId) => {
    let total = 0;
    let receiptsNumber = 0;
    let customerIds = [];
    for(let i = 0; i < receiptsArr.length; i++){
        if(!customerIds.includes(receiptsArr[i].idCustomer)){
            customerIds.push(receiptsArr[i].idCustomer);
        }
        let subReceiptsArr = receiptsArr[i].receipts;
        for(let n = 0; n < subReceiptsArr.length; n++){
            saveReceiptData(subReceiptsArr[n], merchantId);
            total += parseFloat(subReceiptsArr[n].total);
            receiptsNumber++;
        }
    }
    let average = total/receiptsNumber;
    return {"average": average, "total": total, "receiptsNumber": receiptsNumber, "customerIds": customerIds}
}
const saveReceiptData = (receiptData, merchantId) => {
    //save receipt
    let receipt = {idMerchant: merchantId, receiptId: receiptData.idReceipt, date: receiptData.date, total: receiptData.total, items: receiptData.items}
    let newReceiptData = new Receipts(receipt);
    newReceiptData.save().then((newReceipt) => {
        //console.log(newReceipt);
    }).catch((e) => {
        console.log('fail to save receipt: ' + e);
    });
}

//---start monthly chart data
router.get('/average-monthly', authenticate, (req, res) => {
    let merchantData = req.merchant;
    let currentDate = new Date();
    let currentYearStr = currentDate.getFullYear() + "-01-01";
    let currentYearDate = new Date(currentYearStr);
    //{ name: 'Space Ghost', age: { $gte: 21, $lte: 65 }}
    DailyAverageSales.find({
        idMerchant: merchantData.idMerchant,
        date: { $gte: currentYearDate }
    }).then((result) => {
        let monthly_data = [
            { month: "January", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "February", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "March", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "April", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "May", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "June", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "July", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "August", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "September", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "October", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "November", average: 0, total: 0, receiptsNumber: 0, customerIds: [] },
            { month: "December", average: 0, total: 0, receiptsNumber: 0, customerIds: [] }
        ];
        for (let i = 0; i < result.length; i++) {
            monthly_data[result[i].date.getMonth()].average += result[i].average;
            monthly_data[result[i].date.getMonth()].total += result[i].total;
            monthly_data[result[i].date.getMonth()].receiptsNumber += result[i].receiptsNumber;
            //calc monthly number of customers without duplicate
            let currentMonthIds = [...monthly_data[result[i].date.getMonth()].customerIds];
            for (let n = 0; n < result[i].customerIds.length; n++) {
                if (currentMonthIds.indexOf(result[i].customerIds[n]) === -1) {
                    currentMonthIds.push(result[i].customerIds[n]);
                }
            }
            monthly_data[result[i].date.getMonth()].customerIds = [...currentMonthIds];
        }
        res.send(monthly_data);
    }, (err) => {
        res.status(400).send(err);
    });
});
//--- start peak hours api
router.get('/peak-hours', authenticate, (req, res) => {
    let merchantData = req.merchant;
    Receipts.find({
        idMerchant: merchantData.idMerchant
    }).then((result) => {
        let hours_data = [
            { hour: "1", receiptsNumber: 0 },
            { hour: "2", receiptsNumber: 0 },
            { hour: "3", receiptsNumber: 0 },
            { hour: "4", receiptsNumber: 0 },
            { hour: "5", receiptsNumber: 0 },
            { hour: "6", receiptsNumber: 0 },
            { hour: "7", receiptsNumber: 0 },
            { hour: "8", receiptsNumber: 0 },
            { hour: "9", receiptsNumber: 0 },
            { hour: "10", receiptsNumber: 0 },
            { hour: "11", receiptsNumber: 0 },
            { hour: "12", receiptsNumber: 0 },
            { hour: "13", receiptsNumber: 0 },
            { hour: "14", receiptsNumber: 0 },
            { hour: "15", receiptsNumber: 0 },
            { hour: "16", receiptsNumber: 0 },
            { hour: "17", receiptsNumber: 0 },
            { hour: "18", receiptsNumber: 0 },
            { hour: "19", receiptsNumber: 0 },
            { hour: "20", receiptsNumber: 0 },
            { hour: "21", receiptsNumber: 0 },
            { hour: "22", receiptsNumber: 0 },
            { hour: "23", receiptsNumber: 0 },
            { hour: "24", receiptsNumber: 0 }
        ];
        for (let i = 0; i < result.length; i++) {
            hours_data[result[i].date.getHours()].receiptsNumber += 1;
        }
        res.send(hours_data);
    }, (err) => {
        res.status(400).send(err);
    });
});

//--- start Product Mix api
router.get('/prodcts', authenticate, (req, res) => {
    let merchantData = req.merchant;
    Receipts.find({
        idMerchant: merchantData.idMerchant
    }).then((result) => {
        let itemsArr = [];
        let totalCounts = 0;
        for (let i = 0; i < result.length; i++) {
            for (let n = 0; n < result[i].items.length; n++) {
                totalCounts += result[i].items[n].count;
                let searchItem = findItem(result[i].items[n], itemsArr);
                if (searchItem === -1) {
                    itemsArr.push({ "item": result[i].items[n].item, "count": result[i].items[n].count });
                } else {
                    itemsArr[searchItem.position].count += searchItem.item.count;
                }
            }
        }
        function compareCounts(a, b) {
            if (a.count > b.count)
                return -1;
            if (a.count < b.count)
                return 1;
            return 0;
        }
        itemsArr.sort(compareCounts);
        let top10Items = itemsArr.slice(0, 10);
        let top10Count = 0;
        for (let x = 0; x < top10Items.length; x++) {
            top10Count += top10Items[x].count;
        }
        let otersCount = totalCounts - top10Count;
        let finalResult = {
            totalCounts: totalCounts,
            othersCount: otersCount,
            top10Items: top10Items
        }
        res.send(finalResult);
    }, (err) => {
        res.status(400).send(err);
    });
});
const findItem = (item, itemsArray) => {
    let result = -1;
    for (let i = 0; i < itemsArray.length; i++) {
        if (itemsArray[i].item === item.item) {
            result = { "item": item, "position": i };
        }
    }
    return result
}
//--- end /merchant/chart ---

module.exports = router;