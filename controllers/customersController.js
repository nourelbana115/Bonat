
const _ = require('lodash');
const axios = require('axios');
const customersServices = require('../services/mainBackendServices/customersServices');
const logger = require('../services/logger');
const Segment = require('../db/models/Segments');
const { generalResponse } = require('../requests/helpers/responseBody');
const customersFeedback = require('../db/models/customersFeedback')
const paginator = require('../services/paginator')
const segmentServices = require('../services/mainBackendServices/segmentsServices');
//--- start customer information api
const customerInfo = (req, res) => {
    let merchantData = req.merchant;
    let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers`;
    let config = {
        headers: {
            "Authorization": "Bearer " + req.header('outSideToken')
        },
        params: {
            idMerchant: merchantData.idMerchant
        }
    }
    axios.get(url, config)
        .then(response => {
            let dataObj = response.data;
            let top100Visits;
            let top100Payments;
            //get top 100 visits customers
            function compareVisits(a, b) {
                if (a.visits > b.visits)
                    return -1;
                if (a.visits < b.visits)
                    return 1;
                return 0;
            }
            dataObj.sort(compareVisits);
            top100Visits = dataObj.slice(0, 100);
            //get top 100 payments customers
            function comparePayments(a, b) {
                if (parseFloat(a.payments) > parseFloat(b.payments))
                    return -1;
                if (parseFloat(a.payments) < parseFloat(b.payments))
                    return 1;
                return 0;
            }
            dataObj.sort(comparePayments);
            top100Payments = dataObj.slice(0, 100);
            //get new customers daily/monthly
            let monthly_data = [
                { month: "January", newCustomers: 0 },
                { month: "February", newCustomers: 0 },
                { month: "March", newCustomers: 0 },
                { month: "April", newCustomers: 0 },
                { month: "May", newCustomers: 0 },
                { month: "June", newCustomers: 0 },
                { month: "July", newCustomers: 0 },
                { month: "August", newCustomers: 0 },
                { month: "September", newCustomers: 0 },
                { month: "October", newCustomers: 0 },
                { month: "November", newCustomers: 0 },
                { month: "December", newCustomers: 0 }
            ];
            //set days array
            let dailyData = [];
            let todayDate = new Date();
            let currentMonth = todayDate.getMonth() + 1;
            let monthDaysNum;
            if (currentMonth === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10 || currentMonth === 12) {
                monthDaysNum = 31;
            } else if (currentMonth === 2) {
                monthDaysNum = 28;
            } else {
                monthDaysNum = 30;
            }
            for (let n = 1; n <= monthDaysNum; n++) {
                dailyData.push({ day: todayDate.getFullYear() + "/" + currentMonth + "/" + n, newCustomers: 0 });
            }
            //calc new customers
            for (let i = 0; i < dataObj.length; i++) {
                let currentDate = new Date(dataObj[i].createdAt);
                //monthly
                if (currentDate.getFullYear() === todayDate.getFullYear()) {
                    monthly_data[currentDate.getMonth()].newCustomers += 1;
                }
                //daily
                if (currentDate.getFullYear() === todayDate.getFullYear() && currentDate.getMonth() === todayDate.getMonth()) {
                    dailyData[currentDate.getDate() - 1].newCustomers += 1;
                }
            }
            //final object
            let finalData = {
                "top100Visits": top100Visits,
                "top100Payments": top100Payments,
                "newCustomers": {
                    "daily": dailyData,
                    "monthly": monthly_data
                },
                "customersNumber": dataObj.length
            }
            res.send(finalData);

        })
        .catch(error => {
            logger.log('requests', 'error', error, 'Get Customer info ')
            res.status(400).send(error);
        });
}

//--- start Average Return
const custsVisits = (req, res) => {
    let merchantData = req.merchant;
    //request visits for this merchant for current year
    let currentDate = new Date();
    //start from prev year
    let startDate = (currentDate.getFullYear() - 1) + "-" + customersServices.pad(currentDate.getMonth() + 1) + "-" + customersServices.pad(currentDate.getDate());

    let url = `${process.env.MAIN_BACKEND_API}visit`;
    let config = {
        headers: {
            "Authorization": "Bearer " + req.header('outSideToken')
        },
        params: {
            starting_date: startDate,
            end_date: DYM_dateForm(new Date)
        }
    }
    axios.get(url, config)
        .then(response => {
            let dataObj = response.data.data;
            let monthly_data = [
                { month: "January", visits: 0 },
                { month: "February", visits: 0 },
                { month: "March", visits: 0 },
                { month: "April", visits: 0 },
                { month: "May", visits: 0 },
                { month: "June", visits: 0 },
                { month: "July", visits: 0 },
                { month: "August", visits: 0 },
                { month: "September", visits: 0 },
                { month: "October", visits: 0 },
                { month: "November", visits: 0 },
                { month: "December", visits: 0 }
            ];
            let todayDate = new Date();
            let currentMonthVisits = []
            let customersVisits = {};
            for (let i = 0; i < dataObj.length; i++) {
                let currentDate = new Date(dataObj[i].date);
                //monthly
                if (currentDate.getFullYear() === todayDate.getFullYear()) {
                    monthly_data[currentDate.getMonth()].visits += 1;
                    if (currentDate.getMonth() === new Date().getMonth()) {
                        currentMonthVisits.push(dataObj[i]);
                    }
                }
                //set visits per customer 
                if (customersVisits[dataObj[i].idCustomer]) {
                    customersVisits[dataObj[i].idCustomer].push(dataObj[i]);
                } else {
                    customersVisits[dataObj[i].idCustomer] = [dataObj[i]];
                }
            }
            // calc visits for pear day and customer
            let customersVisitsDates = {};
            //set defualt data
            let currentMonth = todayDate.getMonth() + 1;
            let monthDaysNum;
            if (currentMonth === 1 || currentMonth === 3 || currentMonth === 5 || currentMonth === 7 || currentMonth === 8 || currentMonth === 10 || currentMonth === 12) {
                monthDaysNum = 31;
            } else if (currentMonth === 2) {
                monthDaysNum = 28;
            } else {
                monthDaysNum = 30;
            }
            for (let n = 1; n <= monthDaysNum; n++) {
                customersVisitsDates[todayDate.getFullYear() + "/" + customersServices.pad(currentMonth) + "/" + customersServices.pad(n)] = { "new": 0, "old": 0 }
            }
            //calc all visits numbers
            currentMonthVisits.map((currentVisit) => {
                if (customersServices.checkIfFirstVisit(currentVisit, customersVisits)) {
                    customersVisitsDates[customersServices.getDay(currentVisit.date)].new += 1;
                } else {
                    customersVisitsDates[customersServices.getDay(currentVisit.date)].old += 1;
                }
            });
            res.send({ "monthlyData": monthly_data, "newOldVisits": customersVisitsDates });

        })
        .catch(error => {
            logger.log('requests', 'error', error, 'Get Customer Custs Visists')
            res.status(400).send({ "error": "can not access customer info." });
        });
};

// get customers statistics
const customersStats = (req, res) => {
    // check segment type
    let segmentType = req.query.segmentType
    let merchantData = req.merchant;
    let query = { idMerchant: merchantData.idMerchant }
    let defaultSegments = segmentServices.getDefaultSegmentTypes()
    if (!defaultSegments.includes(segmentType)) {
        res.status(400).send(generalResponse({}, [], "Error segment not in default segments"));
    }
    getSegmentCustomers(merchantData, segmentType)
        .then((response) => {
            res.send(generalResponse({ "customers": response }, [], 'Segment Customers'));
        })
        .catch((err) => {
            res.status(400).send(generalResponse({}, [], "Error getting Segment Customers" + err));
        })
    // }).catch((error) => {
    //     console.log('ERR', error)
    //     return res.status(400).send(error)
    // })
}

const getSegmentCustomers = async (merchant, segmentType) => {
    const segment = await Segment.findOne({ merchant: merchant._id, segmentType: segmentType });
    return await customersServices.customersInSegment(merchant, segment._id);
}

// const customersFeedBack = (req, res) => {

//     customersServices.getCustomersFeedBack(req)

//         .then((customersFeed) => res.status(200).send({ "data": { "customers": customersFeed } }))

//         .catch((error) => res.status(400).send({ "errors": error }));
// };

const feedBackMarkAsRead = (req, res) => {

    customersServices.markFeedBackAsRead(req)

        .then((response) => res.status(200).send({ "data": { "message": "marked as read successfully" } }))

        .catch((error) => res.status(400).send({ "errors": { "message": "something went wrong." } }));
};

const getPaginatedSegmentCustomers = (req, res) => {
    customersServices.getSegmentCustomers(req.merchant, req.params.segmentType, req.params.page)
        .then((response) => {
            res.send(generalResponse({ "customers": response }, [], 'Segment Customers'));
        })
        .catch((err) => {
            res.status(400).send(generalResponse({}, [], "Error getting Segment Customers" + err));
        })
}

const customersFeedBack = (req,res) =>{
    // let limit = 25;
    // let query = {merchant:req.merchant._id}
    // let page = (req.params.page)?parseInt(req.params.page):1;
    // paginator({ model:customersFeedback, query:query, page:page, limit:limit })
    // .then((response)=> res.send(generalResponse({"customers":response},[],'feedback found successfully')))
    // .catch((err) => 
    // {console.log(err); return res.status(400).send(generalResponse({},[],'cant find any feedback'))})
    customersFeedback.find({merchant:req.merchant._id})
    .then((response)=> res.send(generalResponse({"customers":response },[],'feedback found successfully')))
    .catch((err) => res.status(400).send(generalResponse({},[],'cant find any feedback')))
}

const paginatedCustomersFeedBack = (req, res) => {
    let limit = 25;
    let query = {merchant:req.merchant._id}
    let page = (req.params.page)?parseInt(req.params.page):1;
    paginator({ model:customersFeedback, query:query, page:page, limit:limit })
    // .then((response)=> res.send(generalResponse({"customers":response},[],'feedback found successfully')))
    // .catch((err) => 
    // {console.log(err); return res.status(400).send(generalResponse({},[],'cant find any feedback'))})
    // customersFeedback.find({ merchant: req.merchant._id })
        .then((response) => res.send(generalResponse({ "feedback": response }, [], 'feedback found successfully')))
        .catch((err) => res.status(400).send(generalResponse({}, [], 'cant find any feedback')))
}
module.exports = {
    customerInfo,
    custsVisits,
    customersStats,
    customersFeedBack,
    paginatedCustomersFeedBack,
    feedBackMarkAsRead,
    getSegmentCustomers,
    getPaginatedSegmentCustomers
};
