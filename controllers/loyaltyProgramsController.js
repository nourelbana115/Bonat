const _ = require('lodash');
const bodyParser = require('body-parser');
const express = require('express');
const { generalResponse } = require('../requests/helpers/responseBody');

let app = express();
app.use(bodyParser.json());

let { LoyaltyPrograms } = require('../db/models/LoyaltyPrograms');
let { statistics } = require('../db/models/statistics')

let loyaltyProgramsServices = require('../services/mainBackendServices/loyaltyProgramsServices')

// loyalty programs with campaign type = 2
exports.addLoyaltyProgram = (req, res) => {
  const body = _.pick(req.body, [
    'title', 'status', 'title_ar', 'description', 'description_ar', 'numOfValidDays',
    'imageUrl', 'coverImageUrl', 'min', 'avg', 'max', 'baseVisit', 'dashboardData',
    'idCampaignType', 'posIdProduct'])
  const merchant = req.merchant

  const program = programHelper(body, merchant)
  loyaltyProgramsServices.saveLoyaltyProgram(program)
    .then(program => {
      loyaltyProgramsServices.filterToDispatchLoyaltyJobs(program)
      res.send(generalResponse({ "loyaltyProgram": program }, [], 'program added successfully '))
    }).catch(err => {
      res.status(400).send(generalResponse({}, [], 'error in creating new program '))
    })
}

// loyalty programs with campain type = 7
exports.addNewLoyaltyProgram = (req, res) => {
  const body = _.pick(req.body, [
    'title', 'status', 'title_ar', 'description', 'description_ar', 'numOfValidDays',
    'imageUrl', 'coverImageUrl', 'pointValue', 'dashboardData',
    'idCampaignType', 'posIdProduct', 'status'])
  const merchant = req.merchant

  let programData = {
    idMerchant: merchant.idMerchant,
    merchant: merchant._id,
    title: body.title,
    title_ar: body.title_ar,
    description: body.description,
    description_ar: body.description_ar,
    numOfValidDays: body.numOfValidDays,
    imageUrl: body.imageUrl,
    coverImageUrl: body.coverImageUrl,
    pointValue: body.pointValue,
    dashboardData: JSON.stringify(body.dashboardData),
    idCampaignType: body.idCampaignType,
    posIdProduct: body.posIdProduct,
    createdAt: new Date(),
    latestUpdate: new Date()
  }
  programData = programSetStatus(programData, body.status);
  loyaltyProgramsServices.saveLoyaltyProgram(programData)
    .then(program => {
      loyaltyProgramsServices.dispatchCreateNewLoyaltyJob(program)
      res.send(generalResponse({ "loyaltyProgram": program }, [], 'program added successfully '))
    })
    .catch(err => {
      res.status(400).send(generalResponse({}, [], 'error in creating new program '))
    })
}

exports.activateLoyalty = (req, res) => {
  LoyaltyPrograms.findById(req.params.loyaltyId)
    .then(program => {
      if (!program.idCampaign) {
        loyaltyProgramsServices.dispatchCreateNewLoyaltyJob(program)
        res.send(generalResponse({ "loyaltyProgram": program }, [], 'program activated successfully'))
      } else {
        res.send(generalResponse({ "loyaltyProgram": program }, [], 'program alread active'))
      }
    })
    .catch(err => {
      console.log(err)
      res.status(400).send(generalResponse({}, [], 'error activating program'))
    })
}

//edit program
// exports.editLoyaltyProgram = (req, res) => {
//     let body = _.pick(req.body, ['title', 'status', 'title_ar', 'description', 'description_ar', 'numOfValidDays',
//         'imageUrl', 'coverImageUrl', 'min', 'avg', 'max', 'baseVisit', 'dashboardData', 'idCampaignType', 'posIdProduct', 'is_active', 'is_drafted'])
//     body.imageUrl = body.imageUrl

//     //check if merchant has program with the same name
//     let merchantData = req.merchant;
//     let loyaltyId = req.query.loyaltyId

//     let query = {
//         idMerchant: req.merchant.idMerchant,
//         idCampaign: loyaltyId
//     }
//     let newData = {
//         idMerchant: merchantData.idMerchant,
//         title: body.title,
//         title_ar: body.title_ar,
//         description: body.description,
//         description_ar: body.description_ar,
//         numOfValidDays: body.numOfValidDays,
//         imageUrl: body.imageUrl,
//         posIdProduct: body.posIdProduct,
//         coverImageUrl: body.coverImageUrl,
//         idCampaignType: body.idCampaignType,
//         minVisits: body.baseVisit,
//         dashboardData: JSON.stringify(body.dashboardData),
//         min: body.min,
//         avg: body.avg,
//         max: body.max,
//         createdAt: new Date(),
//         latestUpdate: new Date(),
//     }
//     newData = programSetStatus(newData, body.status)
//     LoyaltyPrograms.find(query, function (error, doc) {
//         if (!error) {
//             // console.log("Loyalty program is : ", doc)
//             if (doc.is_active == false && newData.is_active == true) {
//                 // activation request.
//                 newData.activationDate = new Date()
//             }
//             LoyaltyPrograms.update(query, newData, function (error, docs) {
//                 if (error) {
//                     console.log('UPDATE ERR: ', error)
//                     return res.status(400).send({
//                         "error": `couldn't update the program with id: ${loyaltyId}`,
//                         "reason": `${error}`
//                     })
//                 } else {
//                     console.log('UPDATE SUCCESS!', docs)
//                     return res.send({
//                         "message": `loyalty program with id : ${loyaltyId} has been updated successfully.`,
//                         "details:": docs
//                     })
//                 }
//             })
//         } else {
//             console.log('ERR', error)
//             return res.status(403).send({
//                 "error": `couldn't find program with id ${loyaltyId}`,
//                 "reason": `${error}`
//             })
//         }
//     })
// }

// set loyalty
exports.publishLoyaltyProgram = (req, res) => {
  let body = _.pick(req.body, ['_id'])

  let merchantData = req.merchant;
  loyaltyProgramsServices.findFromLoyaltyModelWithMerchant(body._id)
    .then(program => {
      let msg = !program ? 'no program found' : 'program found successfully ';

      loyaltyProgramsServices.dispatctSetActiveJob(body._id)

      res.send(generalResponse(program, [], msg))
    })
    .catch(err => {
      res.status(400).send(generalResponse({}, [], 'error in finding new program '))

    })

}

// delete program
exports.deleteLoyaltyProgram = (req, res) => {
  let body = _.pick(req.body, ['name']);
  let merchantData = req.merchant;
  //remove program
  LoyaltyPrograms.findOneAndDelete({
    idMerchant: merchantData.idMerchant,
    name: body.name
  })
    .then(response => {
      if (response) {
        return res.send({ ...response._doc });
      } else {
        res.status(400).send({ "error": "invalid loyalty program name" });
      }
    })
    .catch(err => {
      res.status(400).send(err);
    });
}

// get list
exports.getList = (req, res) => {
  let merchantData = req.merchant;
  //get program list for current merchant
  if (merchantData.idLoyaltyType === 2) {
    query = {
      idMerchant: merchantData.idMerchant,
      idCampaignType: 7
    }
  } else {
    query = {
      idMerchant: merchantData.idMerchant,
      idCampaignType: 3
    }
  }
  LoyaltyPrograms.find(
    query
  ).then((result) => {
    res.send(result);
  }).catch(err => {
    res.status(400).send(err);
  })
}

exports.getStatistics = (req, res) => {
  let loyalityId = req.query.loyalityId
  // TODO check if this id already exsists
  if (!loyalityId) {
    return res.status(400).send({ "message": "loyalty id is not defined" })
  }
  loyaltyProgramsServices.getStatistics(req, loyalityId).then((response) => {
    response = response.data
    let activeCustomers = response.length
    let rewardedCustomers = []
    let customersWithOnePunch = []
    let customersPerPunch = {}
    let idActiveLoyality = req.query.loyalityId
    let maxPunch = 0
    let punchs = []
    maxPunch = Math.max(...punchs)
    for (i in response) {
      // idActiveLoyality = response[i].idActiveLoyality
      // get number of customers per punch
      if (response[i].numberOfPunch in customersPerPunch) {
        customersPerPunch[`${response[i].numberOfPunch}`] += 1
      } else {
        customersPerPunch[`${response[i].numberOfPunch}`] = 1
      }
      // get number of rewarded customers
      if (response[i].numberOfRewardsEarned >= 1) {
        rewardedCustomers.push(response[i])
      }
      if (response[i].numberOfPunch == 1) {
        customersWithOnePunch.push(response[i])
      }
    }
    statisticsData = {
      loyalityId: idActiveLoyality,
      activeCustomers: activeCustomers,
      rewardedCustomers: rewardedCustomers.length,
      punches: customersPerPunch,
      customersWithOnePunch: customersWithOnePunch.length
    }
    let newStatistics = new statistics(statisticsData);
    newStatistics.save().then((response) => {
      return res.send({ ...response._doc });
    }).catch((err) => {
      res.status(400).send(err);
    })
  }).catch((err) => {
    return res.status(400).send(err.errors);
  })
}

const programHelper = (body, merchant) => {
  let programData = {};

  // body.imageUrl = body.imageUrl

  //Program data that will be saved into our DB
  programData = {
    idMerchant: merchant.idMerchant,
    merchant: merchant._id,
    title: body.title,
    title_ar: body.title_ar,
    description: body.description,
    description_ar: body.description_ar,
    numOfValidDays: body.numOfValidDays,
    imageUrl: body.imageUrl,
    posIdProduct: body.posIdProduct,
    coverImageUrl: body.coverImageUrl,
    idCampaignType: body.idCampaignType,
    minVisits: body.baseVisit,
    dashboardData: JSON.stringify(body.dashboardData),
    // reward: body.reward,
    min: body.min,
    avg: body.avg,
    max: body.max,
    createdAt: new Date(),
    latestUpdate: new Date()

  }
  programData = programSetStatus(programData, body.status);



  return programData

}
const programSetStatus = (program, status) => {
  if (status == 'drafted') {
    program.is_drafted = true
    program.is_active = false
  } else if (status == 'active') {
    program.is_drafted = false
    program.is_active = true
  }
  program.status = status
  return program
}
