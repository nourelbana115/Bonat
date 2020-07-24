const axios = require('axios');
const logger = require('./logger')
const { Coupons } = require('../db/models/Coupons')
const { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms')

// Get all campaigns
const getAllCampaigns = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}allCampaigns`
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
        logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'Get All Campaigns')
        return reject(err)
      });
  })
}

// Filter all campaigns to specific campaigns
const filterCoupons = async (merchant) => {
  const allCampaigns = await getAllCampaigns(merchant)
  const coupons = allCampaigns.filter(campaign => campaign.idCampaignType == 2)
  return coupons
}

// const filterGifts = async (merchant) => {
//   const allCampaigns = await getAllCampaigns(merchant)
//   const gifts = allCampaigns.filter(campaign => campaign.idCampaignType == 5)
//   return gifts
// }

const filterOldLoyalty = async (merchant) => {
  try {
    const allCampaigns = await getAllCampaigns(merchant)
    const programs = allCampaigns.filter(campaign => campaign.idCampaignType == 3)
    return programs
  } catch (err) {
    logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'filter loyalty programs')
  }
}

const filterNewLoyalty = async (merchant) => {
  try {
    const allCampaigns = await getAllCampaigns(merchant)
    const programs = allCampaigns.filter(campaign => campaign.idCampaignType == 7)
    return programs
  } catch (err) {
    logger.log('requests', 'error', `${err} for merchant: ${merchant.idMerchant}`, 'filter loyalty programs')
  }
}

// Save Campaigns

// Save Coupons
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
  const response = await filterCoupons(merchant)
  for (coupon of response) {
    const couponData = {
      idMerchant: coupon.idMerchant,
      title: coupon.title,
      title_ar: "كوبون",
      description: coupon.description,
      description_ar: "كوبون",
      idCampaignType: coupon.idCampaignType,
      idCity: coupon.idCity || 0,
      oldPrice: coupon.oldPrice,
      newPrice: coupon.newPrice,
      discount: Math.round(coupon.oldPrice - coupon.newPrice),
      startDate: new Date(),
      numOfValidDays: coupon.numOfValidDays,
      numAvailable: coupon.numAvailable,
      maxOwner: coupon.maxOwner,
      idCampaign: coupon.idCampaign,
      dashboardData: coupon.dashboardData,
      createdAt: coupon.createdAt || new Date(),
      expirationDate: new Date(coupon.expirationDate),
      latestUpdate: new Date(),
      is_reward: Boolean(coupon.isReward),
      imageUrl: coupon.imageUrl
    }
    const couponWithStatus = setStaus(couponData, coupon.idCampaignStatus)
    await saveCoupon(couponWithStatus)
  }
}

// Save Gifts
// const saveGift = (giftData) => {
//   return new Promise((resolve, reject) => {
//     let newGift = new Gift(giftData);
//     newGift.save().then((newGift) => {
//       return resolve({ ...newGift._doc });
//     }).catch((err) => {
//       logger.log('requests', 'error', err, 'Saving Gift To Db')
//       return reject(e)
//     });
//   })
// }

// const saveHistoricalGifts = async (merchant) => {
//   const response = await filterGifts(merchant)
//   for (gift of response) {
//     const giftData = {
//       merchant: merchant._id,
//       idCampaign: gift.idCampaign,
//       title: gift.title,
//       title_ar: gift.title_ar,
//       description: gift.description,
//       description_ar: gift.description_ar,
//       numOfValidDays: gift.numOfValidDays,
//       imageUrl: gift.imageUrl,
//       receivedCustomers: [],
//       dashboardData: gift.dashboardData,
//       status: "draft",
//       idCampaignType: gift.idCampaignType,
//       createdAt: gift.createdAt,  
//       latestUpdate: new Date(),
//     }
//     await saveGift(giftData)
//   }
// }

// Save loyalty programs
const saveProgram = (programData) => {
  return new Promise((resolve, reject) => {
    let newProgram = new LoyaltyPrograms(programData);
    newProgram.save().then((newProgram) => {
      return resolve({ ...newProgram._doc });
    }).catch((err) => {
      logger.log('requests', 'error', err, 'Saving Program To Db')
      return reject(err)
    });
  })
}

const saveHistoricalOldPrograms = async (merchant) => {
  const response = await filterOldLoyalty(merchant)
  for (program of response) {
    const programData = {
      merchant: merchant._id,
      idMerchant: merchant.idMerchant,
      idCampaign: program.idCampaign,
      title: program.title,
      title_ar: program.title_ar,
      description: program.description,
      description_ar: program.description_ar,
      numOfValidDays: program.numOfValidDays,
      imageUrl: program.imageUrl,
      min: 0,
      avg: 0,
      max: 0,
      baseVisits: program.minVisits,
      dashboardData: program.dashboardData,
      idCampaignType: program.idCampaignType,
      createdAt: program.createdAt,
      latestUpdate: new Date(),
    }
    const programWithStatus = setStaus(programData, program.idCampaignStatus)
    await saveProgram(programWithStatus)
  }
}

const saveHistoricalNewPrograms = async (merchant) => {
  const response = await filterNewLoyalty(merchant)
  for (program of response) {
    const programData = {
      merchant: merchant._id,
      idMerchant: merchant.idMerchant,
      idCampaign: program.idCampaign,
      title: program.title,
      title_ar: program.title_ar,
      description: program.description,
      description_ar: program.description_ar,
      numOfValidDays: program.numOfValidDays,
      imageUrl: program.imageUrl,
      pointValue: program.newPrice,
      baseVisits: program.minVisits,
      dashboardData: program.dashboardData,
      idCampaignType: program.idCampaignType,
      createdAt: program.createdAt,
      latestUpdate: new Date(),
    }
    const programWithStatus = setStaus(programData, program.idCampaignStatus)
    await saveProgram(programWithStatus)
  }
}

const setStaus = (campaign, campaignStatus) => {
  if (campaignStatus == 1) {
    campaign.status = 'active'
    campaign.is_active = true
    campaign.is_drafted = false
  } else if (campaignStatus == 2) {
    campaign.status = 'drafted'
    campaign.is_active = false
    campaign.is_drafted = true
  } else if (campaignStatus == 3) {
    campaign.status = 'history'
    campaign.is_active = false
    campaign.is_drafted = false
  }
  return campaign
}

const saveHistoricalData = async (merchant) => {
  return await Promise.all([
    saveHistoricalNewPrograms(merchant),
    saveHistoricalCoupons(merchant),
    saveHistoricalOldPrograms(merchant)
  ])
}

module.exports = { saveHistoricalData };