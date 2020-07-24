const { Merchant } = require('../../../db/models/merchant');

const dashboardServices = require('../../mainBackendServices/dashboardServices');

const { getCurrentJobName } = require('./jobHelpers');

const jobName = getCurrentJobName(__filename);

const getAllMerchants = () => {

  return new Promise((resolve, reject) => {

    Merchant.find({})

      .then(merchants => resolve(merchants))

      .catch(error => reject(error))
  });
}
const updateData = (merchants) => {
  return Promise.all(merchants.map(merchant => {
    return new Promise((resolve, reject) => {

      dashboardServices.updateMerchantInfo(merchant)

        .then(updatedStats => resolve(updatedStats))

        .catch(error => reject(error))

    })

  }));
}

const run = async (data) => {

  const merchants = await getAllMerchants();
  console.log('start from priorty 1')

  if (!merchants && !merchants.length) throw 'no merchants found'

  return await updateData(merchants);

}
module.exports = run;
