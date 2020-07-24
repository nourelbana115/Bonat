const loyaltyProgramsServices = require('../../mainBackendServices/loyaltyProgramsServices');
const {getCurrentJobName} = require('./jobHelpers');
const jobName = getCurrentJobName(__filename);



const run = async (data) => {
    let programId = data.programId

    if(!programId ) throw `no program id found ${jobName}`

    let program = await loyaltyProgramsServices.findFromLoyaltyModelWithMerchant(programId)

    if(!program || !program.idCampaign ) throw `no program found with id ${programId}`

    let publishData = {
        idActiveLoyalty: program.idCampaign,
        min: program.min,
        avg: program.avg,
        max: program.max,
        baseVisit: program.minVisits
    }

    let setLoyalty = await loyaltyProgramsServices.setLoyalty(program.merchant,publishData);

    const deactivate = await loyaltyProgramsServices.deactivateOtherLoyaltyPrograms(program)

    return await loyaltyProgramsServices.updateProgramToBeActive(programId)
     
}

module.exports = run;