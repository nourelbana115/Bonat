const loyaltyProgramsServices = require('../../mainBackendServices/loyaltyProgramsServices');
const { getCurrentJobName } = require('./jobHelpers');
const jobName = getCurrentJobName(__filename);



const run = async (data) => {
  let programId = data.programId

  if (!programId) throw `no program id found ${jobName}`

  let program = await loyaltyProgramsServices.findFromLoyaltyModelWithMerchant(programId)

  if (!program) throw `no program found with id ${programId}`

  let dataToCreate = {
    title: program.title,
    title_ar: program.title_ar,
    description: program.description,
    description_ar: program.description_ar,
    numOfValidDays: program.numOfValidDays,
    imageUrl: program.imageUrl,
    pointValue: program.pointValue,
    is_active: program.is_active,
    is_drafted: program.is_drafted,
    posIdProduct: program.posIdProduct,
    coverImageUrl: program.coverImageUrl,
    idCampaignType: program.idCampaignType,
    dashboardData: JSON.stringify(program.dashboardData)
  }

  let programWithIdCampaign = await loyaltyProgramsServices.createNewLoyalty(program.merchant, dataToCreate);

  if (!programWithIdCampaign.data.idCampaign) throw `new program is not created for program id ${programId}`

  const idCampaign = programWithIdCampaign.data.idCampaign

  return await loyaltyProgramsServices.updateProgramToAddIdCampaign(programId, idCampaign)

}

module.exports = run;