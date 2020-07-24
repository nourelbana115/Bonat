require('../config/config');
// const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const axios = require('axios');
const express = require('express');
// var router = express.Router();
// const ses = require('node-ses');
// const s3 = require('s3');
// const fileUpload = require('express-fileupload');
// const upload = require('../services/multer');
// const singleUpload = upload.single('image');

let app = express();
app.use(bodyParser.json());

// const mongo = require('mongodb').MongoClient
// const dbUrl = 'mongodb://localhost:27017'

// let { mongoose } = require('../db/mongoose');
// let { Merchant } = require('../db/models/merchant');
// let { Receipts } = require('../db/models/Receipts');
// let { DailyAverageSales } = require('../db/models/DailyAverageSales');
// let { Segments } = require('../db/models/Segments');
let { Coupons } = require('../db/models/Coupons');
// let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
// let { Gift } = require('../db/models/gifts');
let { CouponStatistics } = require('../db/models/couponStatistics');
// let { statistics } = require('../db/models/statistics')
// let { Ads } = require('../db/models/Ads');
// let { authenticate } = require('../middleware/authenticate');
const couponServices = require('../services/mainBackendServices/couponServices');
const { generalResponse } = require('../requests/helpers/responseBody');


//adding coupon
exports.addCoupon = (req, res) => {
    let body = _.pick(req.body, ['title', 'status', 'title_ar', 'description_ar', 'description', 'oldPrice', 'newPrice', 'startDate', 'expirationDate',
        'numAvailable', 'imageUrl', 'idCity', 'idCampaignType', 'maxOwner', 'numOfValidDays', 'dashboardData', 'is_reward', 'is_active', 'is_drafted', 'discount']);
    let merchantData = req.merchant;
    //check if merchant has coupon with the same title
    Coupons.find({
        idMerchant: merchantData.idMerchant,
        title: body.title
    }).then(
        (result) => {
            if (result.length === 0) {
                //add new coupon
                let couponData = {
                    idMerchant: merchantData.idMerchant,
                    title: body.title,
                    title_ar: body.title_ar,
                    description: body.description,
                    description_ar: body.description_ar,
                    oldPrice: body.oldPrice,
                    newPrice: body.newPrice,
                    is_reward: body.is_reward,
                    numAvailable: body.numAvailable,
                    imageUrl: body.imageUrl,
                    idCity: body.idCity,
                    idCampaignType: body.idCampaignType,
                    maxOwner: body.maxOwner,
                    numOfValidDays: body.numOfValidDays,
                    dashboardData: JSON.stringify(body.dashboardData),
                    is_active: body.is_active,
                    is_drafted: body.is_drafted,
                    discount: body.discount,
                    startDate: body.startDate,
                    expirationDate: body.expirationDate,
                    latestUpdate: new Date(),
                    createdAt: new Date()
                }
                let createdCoupon = couponSetPublished(couponData, body.status)
                couponServices.createCoupon(req, createdCoupon).then((couponResponse) => {
                    if (couponResponse.code == 1) {
                        return res.status(400).send({ "main-backend-errors": couponResponse.errors })
                    }
                    couponData.idCampaign = couponResponse.data.idCampaign
                    let couponWithStatus = couponSetStatus(couponData, body.status)
                    let newCoupons = new Coupons(couponWithStatus)
                    newCoupons.save().then((response) => {
                        return res.send({ newCoupons });
                    }).catch((err) => {
                        res.status(400).send(err);
                    })
                }).catch((err) => {
                    return res.status(400).send(err);
                })
                // save coupon to DB

            } else {
                res.status(403).send({ "error": "you have coupon with the same title" });
            }
        }, (err) => {
            res.status(400).send(err);
        }
    )
}
//editing a coupon
exports.editCoupon = (req, res) => {
    let body = _.pick(req.body, ['title', 'status', 'title_ar', 'description_ar', 'description', 'oldPrice', 'newPrice', 'startDate', 'expirationDate',
        'numAvailable', 'imageUrl', 'idCity', 'idCampaignType', 'maxOwner', 'numOfValidDays', 'dashboardData', 'is_reward', 'is_active', 'is_drafted', 'discount']);
    let merchantData = req.merchant;
    let idCampaign = req.query.idCampaign

    if (!idCampaign) {
        return res.status(400).send({ "message": "Campaign id is not defined" })
    }

    let query = {
        idMerchant: req.merchant.idMerchant,
        idCampaign: idCampaign
    }
    let newData = {
        idMerchant: merchantData.idMerchant,
        title: body.title,
        title_ar: body.title_ar,
        description: body.description,
        description_ar: body.description_ar,
        oldPrice: body.oldPrice,
        newPrice: body.newPrice,
        is_reward: body.is_reward,
        numAvailable: body.numAvailable,
        imageUrl: body.imageUrl,
        idCity: body.idCity,
        idCampaignType: body.idCampaignType,
        maxOwner: body.maxOwner,
        numOfValidDays: body.numOfValidDays,
        dashboardData: body.dashboardData,
        expirationDate: body.expirationDate,
        is_active: body.is_active,
        discount: body.discount,
        startDate: body.startDate,
        is_drafted: body.is_drafted,
        latestUpdate: new Date(),
        createdAt: new Date()
    }
    Coupons.find(query, function (error, doc) {
        if (!error) {
            newData = couponSetStatus(newData, body.status)
            if (doc.is_active == false && newData.is_active == true) {
                // activation request.
                newData.activationDate = new Date()
            }
            Coupons.update(query, newData, function (error, docs) {
                if (error) {
                    console.log('UPDATE ERR: ', error)
                    return res.status(400).send({
                        "error": `couldn't update the Coupon with id: ${idCampaign}`,
                        "reason": `${error}`
                    })
                } else {
                    console.log('UPDATE SUCCESS!', docs)
                    return res.send({
                        "message": `Coupon with id : ${idCampaign} has been updated successfully.`,
                        "details:": { docs }
                    })
                }
            })
        } else {
            console.log('ERR', error)
            return res.status(403).send({
                "error": `couldn't find coupon with id ${idCampaign}`,
                "reason": `${error}`
            })
        }

    })
}
//deleting a coupon 
exports.deleteCoupon = (req, res) => {
    let body = _.pick(req.body, ['name']);
    let merchantData = req.merchant;
    //remove coupons with this name
    let query = { idMerchant: merchantData.idMerchant, name: body.name };
    Coupons.deleteMany(query, function (error, docs) {
        if (error) {
            res.status(400).send(error);
        } else {
            if (docs.n === 0) {
                res.status(403).send({ "error": "you don't have coupon with this name" });
            } else {
                res.send(docs);
            }
        }
    });
}

//get all coupons 
exports.allCoupons = (req, res) => {
    let merchantData = req.merchant;
    //get coupons list for current merchant
    Coupons.find({
        idMerchant: merchantData.idMerchant
    }).then(
        (result) => {
            res.send(result);
        }, (err) => {
            res.status(400).send(err);
        }
    )
}

//get all coupons titles
exports.allCouponsTitles = (req, res) => {
    let merchantData = req.merchant;
    //get coupons list for current merchant
    Coupons.find({
        idMerchant: merchantData.idMerchant,
        is_active: true
    }).then((coupons) => {
        const titles = coupons.map((coupon) => { return { title: coupon.title, id: coupon._id } })
        res.send(generalResponse({ "titles": titles }));
    }, (err) => {
        res.status(400).send(err);
    }
    )
}

// get coupons statistics
exports.couponStat = (req, res) => {
    let couponStatsObject = []
    let counter = 0
    couponServices.getCampaignStatsObject(req, res).then((campaignStatsResponse) => {

        for (i = 0; i < campaignStatsResponse.length; i++) {
            couponServices.couponStats(req, campaignStatsResponse[i]).then((response) => {
                couponStatsObject.push(response)
                counter++;
                if (counter == campaignStatsResponse.length) {
                    couponServices.updateStats(couponStatsObject).then((response) => {

                        return res.send(generalResponse({ "coupon": couponStatsObject[0] }, [], "added successfully"));

                    }).catch((err) => {
                        return res.status(400).send(generalResponse({}, err.errors, "error in getting updating statistics"));
                    })
                }
            }).catch((err) => {
                console.log('err', err)
                return res.status(400).send(generalResponse({}, [], "error in getting coupon statistics"));
            })
        }
    }).catch((err) => {
        console.log('ERR while getting campaign stats object.', err)
        return res.status(400).send(generalResponse({}, [], "error in getting Campaign Stats Object "));
    })
}


// get coupons statistics
exports.couponAllStat = (req, res) => {
    let couponStatsObject = []
    let counter = 0
    couponServices.getCampaignStatsObject(req, res).then((campaignStatsResponse) => {

        for (i = 0; i < campaignStatsResponse.length; i++) {
            couponServices.couponStats(req, campaignStatsResponse[i]).then((response) => {
                couponStatsObject.push(response)
                counter++;
                if (counter == campaignStatsResponse.length) {
                    couponServices.updateStats(couponStatsObject).then((response) => {
                        return res.send(generalResponse({ "coupon": couponStatsObject }, [], "added successfully"));
                    }).catch((err) => {
                        res.status(400).send(err)
                    })
                }
            }).catch((err) => {
                return res.status(400).send(generalResponse({}, [], "error in getting coupon statistics"));
            })
        }
    }).catch((err) => {
        return res.status(400).send(generalResponse({}, [], "error in getting Campaign Stats Object "));
    })
}


// unpublish coupon
exports.couponUnpublish = (req, res) => {
    let idCampaign = req.params.idCampaign
    couponServices.unpublishCampaign(req, idCampaign).then((response) => {
        if (response.errors.length > 0) {
            return res.status(400).send({ "message": `${response.errors[0]}` })
        }
        Coupons.findOneAndUpdate({ idCampaign: idCampaign }, { is_active: false }, function (error, result) {
            if (!error) {
                return res.send(response)
            } else {
                return res.status(400).send(error)
            }
        })
    }).catch((err) => {
        console.log('err', err)
        return res.status(400).send(err)
    })
}

exports.couponChart = (req, res) => {
    const campaignID = req.params.campaignID
    couponServices.getCouponChart(req.merchant, campaignID)
        .then((response) => {
            res.send(generalResponse({ "chart": response }, [], 'Single coupon chart'));
        })
        .catch((err) => {
            res.status(400).send(generalResponse({}, [], 'Single coupon chart'));
        })
}

const couponSetStatus = (coupon, status) => {
    if (status == 'drafted') {
        coupon.is_drafted = true
        coupon.is_active = false
    } else if (status == 'active') {
        coupon.is_drafted = false
        coupon.is_active = true
    }
    return coupon
}

const couponSetPublished = (coupon, status) => {
    if (status == 'drafted') {
        coupon.idCampaignStatus = 2
    } else if (status == 'active') {
        coupon.idCampaignStatus = 1
    }
    return coupon
}

exports.oneCouponStat = (req, res) => {
    const campaign = req.params.idCampaign
    couponServices.calculateOneCouponStat(req.merchant, campaign)
        .then(response => {
            res.send(generalResponse({ "coupon": response }, [], "Single coupon statistic"));
        })
        .catch(err => {
            res.status(400).send(generalResponse({}, [], 'Single coupon statistic'));
        })
}

exports.allCouponsStats = (req, res) => {
    couponServices.calculateCouponStats(req.merchant)
        .then(response => {
            res.send(generalResponse({ "coupon": response }, [], "All coupons statistics"));
        })
        .catch(err => {
            res.status(400).send(generalResponse({}, [], 'All coupons statistics'));
        })
}

exports.oneCouponStatsFromDb = (req, res) => {
    couponServices.getOneCouponStatFromDb(req.merchant, req.params.idCampaign)
        .then(response => {
            res.send(generalResponse({ "coupon": response }, [], "all coupon stats"));
        })
        .catch(err => {
            res.status(400).send(generalResponse({},[], 'all coupon stats'));
        })
}