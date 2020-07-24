require('../../config/config');
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

const logger = require('../logger');

let app = express();
app.use(bodyParser.json());

// const mongo = require('mongodb').MongoClient
// const dbUrl = 'mongodb://localhost:27017'

// let { mongoose } = require('../db/mongoose');
// let { Merchant } = require('../db/models/merchant');
// let { Receipts } = require('../db/models/Receipts');
// let { DailyAverageSales } = require('../db/models/DailyAverageSales');
// let { Segments } = require('../db/models/Segments');
let { Coupons } = require('../../db/models/Coupons');
// let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
// let { Gift } = require('../db/models/gifts');
let { CouponStatistics } = require('../../db/models/couponStatistics');
// let { statistics } = require('../db/models/statistics')
// let { Ads } = require('../db/models/Ads');
//let { authenticate } = require('../middleware/authenticate');
const utilities = require('../../utilities');


const getAllCoupons = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}campaign`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get All Coupons')
        return reject(err)
      });
  })
}

const getOneCouponStat = (merchant, campaign_id) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}couponStats/${campaign_id}`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get All Coupons Stats')
        return reject(err)
      });
  })
}

const getAllCouponsStats = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}couponStats/`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get All Coupons Stats')
        return reject(err)
      });
  })
}

const calculateCouponStats = async (merchant) => {
  try {
    const response = await getAllCouponsStats(merchant)
    const campaigns = await getAllCoupons(merchant)
    let stats = []
    for (coupon of response) {
      try {
        const campaign = campaigns.filter(campaign => campaign.idCampaign == coupon.idCampaign)[0]
        const stat = {
          idCampaign: coupon.idCampaign,
          idMerchant: merchant.idMerchant,
          initialPrice: coupon.oldPrice,
          newPrice: coupon.newPrice,
          discount: Math.round(coupon.oldPrice - coupon.newPrice),
          customerPerCoupon: coupon.maxOwner,
          activeAfterPurchased: campaign.numAvailable,
          expirationDate: campaign.expirationDate,
          leftCoupons: coupon.activeNumAvailable,
          purchasedCoupons: coupon.coupons.length,
          couponsAmount: coupon.totalNumAvailable,
          usedCoupons: coupon.coupons.filter(coupon => coupon.isUsed == true).length,
          validCoupons: coupon.coupons.filter(coupon => coupon.isValid == true).length,
          expiredCoupons: coupon.coupons.filter(coupon => coupon.isValid == false).length,
          isActive: Boolean(coupon.coupons.filter(coupon => coupon.isValid == true).length),
          lastUpdate: new Date()
        }
        stats.push(stat)
      } catch (err) {
        logger.log('general', 'error', `${err} for coupon: ${coupon.idCampaign} for merchant: ${merchant.idMerchant}`, 'saving coupons stats to db')
      }
    }
    return stats;
  } catch (err) {
    logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'saving all coupons stats to db')
    return [];
  }
};

const calculateSoldAndUsedCoupons = async (merchant) => {
  try {
    const response = await getAllCouponsStats(merchant)
    let stats = []
    for (coupon of response) {
      const stat = {
        purchasedCoupons: coupon.coupons.length,
        usedCoupons: coupon.coupons.filter(coupon => coupon.isUsed == true).length
      }
      stats.push(stat)
    }
    return stats
  } catch (err) {
    return []
  }
}

const calculateOneCouponStat = async (merchant, campaign_id) => {
  const response = await getOneCouponStat(merchant, campaign_id);
  const campaigns = await getAllCoupons(merchant);
  const coupon = response[0];
  const campaign = campaigns.filter(campaign => campaign.idCampaign == campaign_id)[0]
  const stat = {
    idCampaign: campaign.idCampaign,
    idMerchant: merchant.idMerchant,
    createdAt: campaign.createdAt,
    initialPrice: campaign.oldPrice,
    newPrice: campaign.newPrice,
    discount: Math.round(campaign.oldPrice - campaign.newPrice),
    customerPerCoupon: coupon.maxOwner,
    activeAfterPurchased: campaign.numAvailable,
    expirationDate: campaign.expirationDate,
    leftCoupons: coupon.activeNumAvailable,
    purchasedCoupons: coupon.coupons.length,
    couponsAmount: coupon.totalNumAvailable,
    usedCoupons: coupon.coupons.filter(coupon => coupon.isUsed == true).length,
    validCoupons: coupon.coupons.filter(coupon => coupon.isValid == true).length,
    expiredCoupons: coupon.coupons.filter(coupon => coupon.isValid == false).length,
    isActive: Boolean(coupon.coupons.filter(coupon => coupon.isValid == true).length),
    lastUpdate: new Date()
  }
  console.log(stat)
  return stat
};

// const getAllCouponsStatsFromDb = async (merchant) => {
//   try {
//     const response = await CouponStatistics.find({ idMerchant: merchant.idMerchant });
//     return response
//   } catch (err) {
//     logger.log('general', 'error', err, 'getting coupons stats from db')
//     return []
//   }
// }

const getOneCouponStatFromDb = async (merchant, idCampaign) => {
  try {
    const response = await CouponStatistics.findOne({ idMerchant: merchant.idMerchant, idCampaign: idCampaign }).sort({ statCreatedAt: -1 });
    if (response) {
      return response
    } else {
      return {
        "idCampaign": idCampaign,
        "initialPrice": 'Unknown',
        "newPrice": 'Unknown',
        "discount": 'Unknown',
        "couponsAmount": 'Unknown',
        "customerPerCoupon": 'Unknown',
        "activeAfterPurchased": 'Unknown',
        "leftCoupons": 'Unknown',
        "expiredCoupons": 'Unknown',
        "usedCoupons": 'Unknown',
        "purchasedCoupons": 'Unknown',
        "createdAt": 'Unknown',
        "expirationDate": 'Unknown',
        "lastUpdate": 'Unknown'
      }
    }
  } catch (err) {
    logger.log('general', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'getting single coupon stat from db')
    return {}
  }
}

const couponStats = (req, campaignObj) => {
  return new Promise((resolve, reject) => {
    getCampaignCoupons(req, campaignObj.idCampaign).then((statsResponse) => {
      if (statsResponse.data.code == 0) {
        campaignObj.leftCoupons = statsResponse.data.data.activeNumAvailable
        campaignObj.purchasedCoupons = statsResponse.data.data.coupons.length
        campaignObj.couponsAmount = statsResponse.data.data.totalNumAvailable
        statsResponse.data.data.coupons.forEach(element => {
          if (element.isValid == false) { campaignObj.expiredCoupons += 1 }
          if (element.isUsed == 1) { campaignObj.usedCoupons += 1 }
          if (element.isValid == true) {
            campaignObj.validCoupons += 1
            campaignObj.isActive = true
          }
          campaignObj.lastUpdate = new Date()
        });
        return resolve(campaignObj)
      } else {
        return resolve(campaignObj)
      }

    }).catch((err) => {
      return reject(err)
    })
  })
}

// update database with new coupons statistics
const updateStats = (statsArray) => {
  return new Promise((resolve, reject) => {
    for (i = 0; i < statsArray.length; i++) {
      CouponStatistics.updateMany({ idCampaign: statsArray[i].idCampaign }, {
        newPrice: statsArray[i].newPrice,
        discount: statsArray[i].discount,
        couponsAmount: statsArray[i].couponsAmount,
        customerPerCoupon: statsArray[i].customerPerCoupon,
        activeAfterPurchased: statsArray[i].activeAfterPurchased,
        leftCoupons: statsArray[i].leftCoupons,
        expiredCoupons: statsArray[i].expiredCoupons,
        usedCoupons: statsArray[i].usedCoupons,
        purchasedCoupons: statsArray[i].purchasedCoupons,
        expirationDate: statsArray[i].expirationDate,
        isActive: statsArray[i].isActive,
        lastUpdate: statsArray[i].lastUpdate,
      }, { upsert: true }, function (err, res) {
        if (!err) {
          return resolve(res)
        } else {
          console.log('err', err)
          return reject(err)
        }
      })
    }
  })
}


// create coupon
const createCoupon = (req, data) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}campaign`
    let config = {
      headers: {
        "Authorization": "Bearer " + req.header('outSideToken')
      }
    }
    axios.post(url, data, config)
      .then((response) => {
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Create Coupon')
        return reject(err)
      });
  })
}

// Unpublish campaign
const unpublishCampaign = (req, idCampaign) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}${idCampaign}/unpublish`
    let config = {
      headers: {
        "Authorization": "Bearer " + req.header('outSideToken')
      }
    }
    let data = {}
    axios.post(url, data, config)
      .then((response) => {
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Unpublish coupon')
        return reject(err)
      });
  })
}

// get campaigns statistics.
const getCampaignStatsObject = (req, res) => {
  let statsData = []
  let campaignData = {}
  return new Promise((resolve, reject) => {
    getAllCampaigns(req).then((response) => {
      if (req.params.idCampaign) {
        response = response.data.filter((res) => { return (res.idCampaign === req.params.idCampaign) })

      } else {
        response = response.data
      }

      for (i in response) {
        campaignData.idCampaign = response[i].idCampaign
        campaignData.idMerchant = response[i].idMerchant
        campaignData.createdAt = response[i].createdAt
        campaignData.initialPrice = response[i].oldPrice
        campaignData.newPrice = response[i].newPrice
        campaignData.discount = Math.round(response[i].oldPrice - response[i].newPrice)
        campaignData.customerPerCoupon = response[i].maxOwner
        campaignData.activeAfterPurchased = response[i].numAvailable
        campaignData.expirationDate = response[i].expirationDate

        campaignData.leftCoupons = 0
        campaignData.purchasedCoupons = 0
        campaignData.couponsAmount = 0
        campaignData.usedCoupons = 0
        campaignData.validCoupons = 0
        campaignData.expiredCoupons = 0
        campaignData.isActive = false
        campaignData.lastUpdate = new Date()

        statsData.push(JSON.parse(JSON.stringify(campaignData)))
      }
      return resolve(statsData)
    }).catch((err) => {
      console.log('@@@@@@@@@', err)
      return reject(err)
    })
  })
}

// get all coupons statistics
function getAllCampaigns(req) {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}campaign`
    let config = {
      headers: {
        "Authorization": "Bearer " + req.header('outSideToken')
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Get All Campaigns')
        return reject(err)
      });
  })
}

// get campaign_id statistics
function getCampaignCoupons(req, campaign_id) {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}couponStats/${campaign_id}`
    let config = {
      headers: {
        "Authorization": "Bearer " + req.header('outSideToken')
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        // console.log('DATA [0] > ', JSON.stringify(response.data))
        return resolve(response)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Get Campaign Coupons')
        console.log('[CATCH-ERR] getCampaignStats(), ', err)
        return reject(err)
      });
  })
}

const returnDateString = (days) => {
  const currentDate = new Date();
  const requiredDate = new Date(currentDate - (1000 * 24 * 60 * 60 * days));
  return `${requiredDate.getFullYear()}-${(requiredDate.getMonth() + 1)}-${requiredDate.getDate()}`
};

const getCouponChart = (merchant, campaignID) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}coupons?starting_date=${returnDateString(14)}&end_date=${returnDateString(0)}&idCampaign=${campaignID}`;
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        if (response.data.code == 1) return reject(response)
        return resolve(response.data.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get Single Coupon Chart')
        return resolve([])
      });
  })
}
const updateCouponsDoc = (query, updateObj) => {

  return new Promise((resolve, reject) => {

    Coupons.findOneAndUpdate(query, updateObj, { new: true, useFindAndModify: false })

      .exec()

      .then((gift) => resolve(gift))

      .catch(error => {
        logger.log('requests', 'error', error, 'Updating Coupon Model')
        reject(error)
      });
  })

}

const unpublishCoupon = async (coupon) => {
  return await updateCouponsDoc(
    { _id: coupon._id },
    {
      $set: {
        is_active: false,
        is_drafted: false,
        updatedAt: new Date()
      }
    }
  );
}

const saveCoupon = (couponData) => {
  return new Promise((resolve, reject) => {
    let newCoupon = new Coupons(couponData);
    newCoupon.save().then((newCoupon) => {
      return resolve({ ...newCoupon._doc });
    }).catch((err) => {
      logger.log('requests', 'error', err, 'Saving Gift To Db')
      return reject(err)
    });
  })
}

const saveHistoricalCoupons = async (merchant) => {
  const response = await getAllCoupons(merchant)
  for (coupon of response) {
    const couponData = {
      idMerchant: coupon.idMerchant,
      title: coupon.title,
      title_ar: "كوبون",
      description: coupon.description,
      description_ar: "كوبون",
      idCampaignType: coupon.idCampaignType,
      idCity: coupon.idCity,
      oldPrice: coupon.oldPrice,
      newPrice: coupon.newPrice,
      discount: Math.round(coupon.oldPrice - coupon.newPrice),
      startDate: new Date(),
      numOfValidDays: coupon.numOfValidDays,
      numAvailable: coupon.numAvailable,
      maxOwner: coupon.maxOwner,
      idCampaign: coupon.idCampaign,
      dashboardData: coupon.dashboardData,
      createdAt: coupon.createdAt,
      expirationDate: coupon.expirationDate,
      latestUpdate: new Date(),
      is_reward: true,
      imageUrl: coupon.imageUrl,
      status: "drafted",
      is_active: false,
      is_drafted: true
    }
    await saveCoupon(couponData)
  }
}

const couponToBeUpdated = (coupons) => {
  const wantedcoupons = coupons.filter(coupon => {
    return (utilities.date.getMonth(coupon.expirationDate) == utilities.date.getMonth())
      && (utilities.date.getDay(coupon.expirationDate) == utilities.date.getDay());
  });
  return wantedcoupons
}

const changeCouponsToHistory = (coupons) => {
  return Promise.all(coupons.map(coupon => {
    return new Promise((resolve, reject) => {
      unpublishCoupon(coupon)
        .then(response => resolve(response))
        .catch(error => reject(error))
    })
  })
  );
}

const getAllCouponsFromDb = () => {
  return new Promise((resolve, reject) => {

    Coupons.find({ is_active: true })

      .then((coupons) => resolve(coupons))

      .catch((error) => reject(error))

  })

}

module.exports = {
  calculateCouponStats,
  calculateOneCouponStat,
  getOneCouponStatFromDb,
  couponStats,
  updateStats,
  createCoupon,
  unpublishCampaign,
  getCampaignStatsObject,
  getCouponChart,
  unpublishCoupon,
  getAllCoupons,
  saveHistoricalCoupons,
  getOneCouponStat,
  getOneCouponStat,
  getAllCampaigns,
  getCampaignCoupons,
  updateCouponsDoc,
  saveCoupon,
  calculateSoldAndUsedCoupons,
  changeCouponsToHistory,
  couponToBeUpdated,
  getAllCouponsFromDb
}