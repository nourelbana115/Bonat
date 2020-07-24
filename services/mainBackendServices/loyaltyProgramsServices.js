const axios = require('axios');
const express = require('express');

const logger = require('../logger');
let { LoyaltyPrograms } = require('../../db/models/LoyaltyPrograms');
const queue = require('../QueuingServices/queue');

// call setLoyalty
const setLoyalty = (merchant, data) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}setLoyalty`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.post(url, data, config)
      .then((response) => {

        if (response.code == 1) {
          reject(response.errors)
        }

        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', error, 'Get Statstics')
        return reject(err)
      });
  })
}

// create Loyalty program with campaign type = 2
const createLoyalty = (merchant, data) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}loyalty`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.post(url, data, config)
      .then((response) => {
        if (response.code == 1) {
          reject(response.errors)
        }
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Create Loyalty')
        return reject(err)
      });
  })
}

// create Loyalty program with campaign type = 7
const createNewLoyalty = (merchant, data) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}rewarditem`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.post(url, data, config)
      .then((response) => {
        if (response.code == 1) {
          reject(response.errors)
        }
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Create Loyalty')
        return reject(err)
      });
  })
}


// get Statistics
const getStatistics = (req, loyalityId) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}getLoyaltyStat/${loyalityId}`
    let config = {
      headers: {
        "Authorization": "Bearer " + req.header('outSideToken')
      }
    }
    axios.get(url, config)
      .then((response) => {
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Get Statstics')
        return reject(err)
      });
  })
}

const updateLoyaltyProgramsModel = (query, object) => {
  return new Promise((resolve, reject) => {

    LoyaltyPrograms.updateMany(query, object, { new: true, useFindAndModify: false })

      .then((program) => resolve(program))

      .catch((error) => {
        logger.log('requests', 'error', error, 'Updating loyalty program date')
        reject(error)
      })
  })
}
const updateOneLoyaltyProgramsModel = (query, object) => {
  return new Promise((resolve, reject) => {

    LoyaltyPrograms.updateOne(query, object, { new: true, useFindAndModify: false })

      .then((program) => resolve(program))

      .catch((error) => {
        logger.log('requests', 'error', error, 'Updating loyalty program date')
        reject(error)
      })
  })
}
const findFromLoyaltyModel = (merchant) => {
  return new Promise((resolve, reject) => {

    LoyaltyPrograms.find({ idMerchant: merchant.idMerchant, is_active: true })
      .then((program) => resolve(program))
      .catch((error) => {
        logger.log('requests', 'error', error, 'Get loyalty program date')
        reject(error)
      })
  })
}

const findFromLoyaltyModelWithMerchant = (programId) => {
  return new Promise((resolve, reject) => {

    LoyaltyPrograms.findById({ _id: programId })
      .populate('merchant', 'token')
      .then((program) => resolve(program))
      .catch((error) => {
        logger.log('requests', 'error', error, 'Get loyalty program date')
        reject(error)
      })
  })
}
const getLoyaltyPorgramDate = (merchantData) => {
  return new Promise((resolve, reject) => {
    let loyaltyobject = {

      type: "loyaltyProgram",
      label: "loyalty program date ",
      items: [{
        label: "No active loyalty available",
        value: null
      }]

    };
    findFromLoyaltyModel(merchantData)
      .then((response) => {
        if (!response.length) return resolve(loyaltyobject)
        else {
          loyaltyobject.items[0].label = "active since"
          loyaltyobject.items[0].value = response[0].activationDate || null
          return resolve(loyaltyobject)
        }
      })
      .catch((error) => reject(error))
  })

}


const getAllPrograms = (merchant) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}loyalty`
    let config = {
      headers: {
        "Authorization": "Bearer " + merchant.token
      }
    }
    axios.get(url, config)
      .then((response) => {
        return resolve(response.data)
      })
      .catch((err) => {
        logger.log('requests', 'error', err, 'Historical Loyalty')
        return reject(err)
      });
  })
}

const saveLoyaltyProgram = (program) => {
  return new Promise((resolve, reject) => {
    const newLoyalty = new LoyaltyPrograms(program)
    newLoyalty.save()
      .then(savedProgram => resolve(savedProgram))

      .catch(err => {
        logger.log('requests', 'error', err, 'Creating Loyalty')
        return reject(err)
      })

  })
}
const filterToDispatchLoyaltyJobs = (program) => {
  if (program.is_active) dispatchActiveLoyaltyJobs(program)

  else dispatchCreateLoyaltyJob(program)
}
const dispatchActiveLoyaltyJobs = (program) => {
  queue.publisher.dispatch([
    {
      jobfile: "createLoyaltyJob",
      data: { programId: program._id }
    },
    {
      jobfile: 'setAndUpdateLoyaltyProgramJob',
      data: {
        programId: program._id,
      }
    }
  ]);
}
const dispatctSetActiveJob = (programId) => {
  queue.publisher.dispatch([
    {
      jobfile: 'setAndUpdateLoyaltyProgramJob',
      data: {
        programId: programId,
      }
    }
  ]);
}
const dispatchCreateLoyaltyJob = (program) => {
  queue.publisher.dispatch([
    {
      jobfile: "createLoyaltyJob",
      data: { programId: program._id }
    }
  ]);
}

const dispatchCreateNewLoyaltyJob = (program) => {
  queue.publisher.dispatch([
    {
      jobfile: "createNewLoyaltyJob",
      data: { programId: program._id }
    }
  ]);
}
const deactivateOtherLoyaltyPrograms = async (program) => {
  return await updateLoyaltyProgramsModel(
    {
      merchant: program.merchant._id,
      _id: { $nin: program._id },
      idCampaignType: 3
    },
    {
      $set: {
        is_active: false,
        latestUpdate: new Date(),
      }
    })
}
const updateProgramToAddIdCampaign = async (programId, idCampaign) => {
  return await updateOneLoyaltyProgramsModel(
    { _id: programId },
    {
      $set: {
        idCampaign: idCampaign,
        latestUpdate: new Date(),
      }
    })
}
const updateProgramToBeActive = async (programId) => {
  return await updateOneLoyaltyProgramsModel(
    { _id: programId },
    {
      $set: {
        is_active: true,
        is_drafted: false,
        activationDate: new Date()
      }
    })
}

module.exports = {
  setLoyalty,
  createLoyalty,
  getLoyaltyPorgramDate,
  getAllPrograms,
  getStatistics,
  saveLoyaltyProgram,
  filterToDispatchLoyaltyJobs,
  findFromLoyaltyModelWithMerchant,
  deactivateOtherLoyaltyPrograms,
  updateProgramToAddIdCampaign,
  updateProgramToBeActive,
  dispatctSetActiveJob,
  dispatchCreateNewLoyaltyJob,
  createNewLoyalty
}