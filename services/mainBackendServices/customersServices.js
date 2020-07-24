const axios = require('axios');

const Customer = require('../../db/models/Customers')
const logger = require('../logger');
const paginator = require('../paginator');
const { feedback } = require('../../db/models/feedbackStatistics');
const customersFeedback = require('../../db/models/customersFeedback')
const Segment = require('../../db/models/Segments');

// get merchant users
function getCustomerCampaignStats(req, merchantData) {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}CustomersCampaignStats`;
        let config = {
            headers: {
                "Authorization": "Bearer " + req.header('outSideToken')
            }
        }
        axios.get(url, config)
            .then((response) => {
                //logger.log('requests', 'info', response.data, 'Get Customer Campaign Stats')
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Customer Campaign Stats')
                return reject(err)
            });
    })
}

// get user feed back
const getCustomersFeedBack = (merchant) => {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}customersFeedback?idMerchant=${merchant.idMerchant}`;
        let config = {
            headers: {
                "Authorization": "Bearer " + merchant.token
            }
        }
        axios.get(url, config)
            .then((response) => {
                //console.log(response.data.data);
                let merchantId = merchant._id;
                return resolve(formatCustomersFeedBack(response.data.data, merchantId))
            })
            .catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Customer Feedback')
                return reject(err)
            });
    })
}

// mark user feed back
const markFeedBackAsRead = (req) => {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}MarkMessageRead`;
        let config = {
            headers: {
                "Authorization": "Bearer " + req.header('outSideToken')
            }
        }
        let data = {
            idInbox: req.body.inboxId
        }
        axios.post(url, data, config)
            .then((response) => {
                let rowsCount = response.data.data.affectedRows;
                let message = `${rowsCount} rows effected`;
                console.log(message);
                return (rowsCount) ? resolve(message) : reject(message);
            })
            .catch((err) => {
                logger.log('requests', 'error', err, 'Mark Feedback as read')
                return reject(err)
            });
    })
}

// helper functions 

const formatCustomersFeedBack = (data, merchantId) => data.map((customer) => {
    return {
        merchant: merchantId,
        inboxId: customer.idInbox,
        message: customer.message,
        email: customer.email,
        name: customer.name,
        createdAt: customer.createdAt,
        idCustomer: customer.idCustomer,
        idMerchant: customer.idMerchant,
        isnew: customer.isNew,
        mood: customer.mood,
        rate: customer.rate,
        scale: customer.scale
    }

});

const pad = (d) => {
    return (d < 10) ? '0' + d.toString() : d.toString();
}

const getDay = (date) => {
    let currentDate = new Date(date);
    return currentDate.getFullYear() + "/" + pad(currentDate.getMonth() + 1) + "/" + pad(currentDate.getDate());
}

function visitsByDate(a, b) {
    if (new Date(a.date) > new Date(b.date))
        return 1;
    if (new Date(a.date) < new Date(b.date))
        return -1;
    return 0;
}

const checkIfFirstVisit = (currentVisit, customersVisits) => {
    let newVisit = false;
    Object.keys(customersVisits).map((currentCustomer) => {
        if (currentCustomer == currentVisit.idCustomer) {
            //check if currentVisit is the first visit for this customer
            let sortedArr = customersVisits[currentCustomer].sort(visitsByDate);
            if (currentVisit.idVisit == sortedArr[0].idVisit) {
                newVisit = true;
            }
        }
    })
    return newVisit
}

const getBranchCustomers = (merchant, branch) => {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers?idBranch=${branch}`;
        let config = {
            headers: {
                "Authorization": "Bearer " + merchant.token
            },
            params: {
                idMerchant: merchant.idMerchant
            }
        }
        axios.get(url, config)
            .then((response) => {
                logger.log('requests', 'info', response.data, 'Get Merchant Customers')
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Merchant Customers')
                return reject(err)
            });
    });
};

function getCustomers(merchant) {
    return new Promise((resolve, reject) => {
        let url = `${process.env.MAIN_BACKEND_API}GetMerchantCustomers`;
        let config = {
            headers: {
                "Authorization": `Bearer ${merchant.token}`
            }
        }
        axios.get(url, config)
            .then((response) => {
                return resolve(response.data)
            })
            .catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Merchant Customers')
                return reject(err)
            });
    })
}

const getSegmentCustomers = async (merchant, segmentType, page) => {
    const segment = await Segment.findOne({ merchant: merchant._id, segmentType: segmentType });
    const response = paginator({ model: Customer, query: { merchant: merchant._id, segments: segment._id }, page: page })
    return await response
}

const customersInSegment = async (merchant, segmentId) => {
    return await Customer.find({ merchant: merchant._id, segments: { $elemMatch: { $eq: segmentId } } })
}

// get all customer feedback
const calculateTotalCommentsAndRate = (feedbackArray) => {
    let totalComments = 0;
    let totatRatings = 0;
    feedbackArray.map((element) => {
        if (element.message) totalComments++;
        if (element.rate && element.rate <= element.scale) totatRatings++;
    })
    return { totatRatings, totalComments }
}
const getTotalCommentsAndRate = (req) => {
    return new Promise((resolve, reject) => {

        let feedback = {

            type: "customersFeedback",
            label: " customers feedback",
            items: [
                {
                    label: "total ratings ",
                    value: 0,
                },
                {
                    label: "total comments ",
                    value: 0
                }
            ]
        }

        let merchant = req.merchant
        findFromCustomersFeedbackModel(merchant)
            .then((response) => {
                if (!response.length) {
                    return resolve(feedback)
                }
                else {
                    let { totalComments, totatRatings } = calculateTotalCommentsAndRate(response);
                    feedback.items[0].value = totatRatings
                    feedback.items[1].value = totalComments;
                    return resolve(feedback)
                }
            }).catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Customer Feedback')
                return reject(err)

            })
    })
}

// const findCustomerId = async (feedbackArray,merchant) =>{
//     console.log(feedbackArray.length)
//     try{
//         for (element of feedbackArray )
//         {
//           let query = {idCustomer:element.idCustomer,merchant:merchant._id}

//           let customer = await Customer.findOne(query)

//           element.customer = customer._id
//         }
//         return(feedbackArray)
//       }
//       catch (err) {
//       logger.log('requests', 'error', err, 'finding  Customers ids')
//         return err
//       }



// }
const findFromCustomersFeedbackModel = (merchant) => {
    return new Promise((resolve, reject) => {

        customersFeedback.find({ merchant: merchant._id })
            .then(updatedStats => resolve(updatedStats))

            .catch(error => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Getting Customers feedback')
                reject(error)
            })

    })
}
const updateCustomerFeedbackDoc = (data) => {
    return new Promise((resolve, reject) => {

        customersFeedback.updateOne({ inboxId: data.inboxId }, data, { upsert: true })

            .then(updatedStats => resolve(updatedStats))

            .catch(error => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Updating Customers Document')
                reject(error)
            })

    })
}
const saveFeedback = (data) => {
    return Promise.all(data.map(element => {
        return new Promise((resolve, reject) => {

            updateCustomerFeedbackDoc(element)

                .then(savedElement => resolve(savedElement))

                .catch(error => reject(error))

        })

    }));
}

const getAndSaveFeedback = async (merchant) => {

    let feedback = await getCustomersFeedBack(merchant)

    if (!feedback.length || !feedback) return `this ${merchant._id} doesn't have any feedback yet`

    else return await saveFeedback(feedback)



}

const feedbackStatistics = async (merchantData) => {

    let feedback = await findFromCustomersFeedbackModel(merchantData)

    if (!feedback.length || !feedback) return `this ${merchantData._id} doesn't have any feedback yet`

    let totalFeedback = feedback.length;

    let categories = devidingIntoCategries(feedback)

    return await updateFeedbackStats(categories, merchantData, totalFeedback)


}
const updateFeedbackStats = (categories, merchant, total) => {
    return Promise.all(categories.map((category) => {
        return new Promise((resolve, reject) => {

            calculatePercentageAndDiff(category, merchant, total)

                .then(result => resolve(result))

                .catch(error => {
                    logger.log('general', 'error', `${error} for merchant: ${merchant.idMerchant}`, 'Update Segment Stats');
                    reject(error);
                });
        });

    }));
}
const calculatePercentageAndDiff = async (category, merchant, total) => {

    let dbValue = await findPercentageFromDb(merchant, category.type)
    category.percentage = calcPercentage(category, total)
    category.percentageDiff = calculateIncAndDec(category, dbValue)
    return await updateFeedback(merchant, category)
}

const updateFeedback = (merchantData, category) => {
    let categoryObj = {
        merchant: merchantData._id,
        type: category.type,
        amount: category.amount,
        label: category.label,
        percentage: category.percentage,
        percentageDiff: category.percentageDiff,
    }
    return new Promise((resolve, reject) => {
        feedback.updateOne({ merchant: merchantData._id, type: categoryObj.type }, categoryObj, { upsert: true, useFindAndModify: false })
            .then(res => resolve(res))
            .catch(err => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Saving Percentage to Database')
                return reject(err)

            })
    })
}

const findPercentageFromDb = (merchantData, categoryType) => {
    return new Promise((resolve, reject) => {
        let dataFromDb = { percentage: 0 }
        feedback.findOne({ merchant: merchantData._id, type: categoryType })
            .then((found) => {
                if (!found) return resolve(dataFromDb)
                else return resolve(found)
            })
            .catch((err) => {
                logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Percentage From Database')
                return reject(err)
            })
    })
}
const devidingIntoCategries = (response) => {
    let categories = {
        veryBad: 0,
        bad: 0,
        normal: 0,
        happy: 0,
        veryHappy: 0
    }
    // for deviding into categories 
    response.map((element) => {
        if (element.rate === 1) categories.veryBad++;
        if (element.rate === 2) categories.bad++;
        if (element.rate === 3) categories.normal++;
        if (element.rate === 4) categories.happy++;
        if (element.rate === 5) categories.veryHappy++;

    })
    let finalCategories = [
        { type: 'veryBad', amount: categories.veryBad, label: 'very bad' },
        { type: 'bad', amount: categories.bad, label: 'bad' },
        { type: 'normal', amount: categories.normal, label: 'normal' },
        { type: 'happy', amount: categories.happy, label: 'happy' },
        { type: 'veryHappy', amount: categories.veryHappy, label: 'very happy' },
    ]
    return finalCategories
}


const calculateIncAndDec = (category, dbValue) => {

    let percentageDiff;
    let sub = dbValue.percentage - category.percentage;
    if (sub === 0) percentageDiff = dbValue.percentageDiff
    else percentageDiff = sub

    return percentageDiff


}

const calcPercentage = (category, totalFeedback) => {
    let percentage;
    if (category.amount === 0) percentage = 0
    else percentage = Math.round((category.amount / totalFeedback) * 100);

    return percentage
}
module.exports = {
    getCustomerCampaignStats,
    pad,
    getDay,
    visitsByDate,
    checkIfFirstVisit,
    getCustomersFeedBack,
    markFeedBackAsRead,
    getCustomers,
    getTotalCommentsAndRate,
    getAndSaveFeedback,
    getSegmentCustomers,
    customersInSegment,
    feedbackStatistics,
    getBranchCustomers
};
