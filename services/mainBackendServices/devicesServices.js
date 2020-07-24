const axios = require('axios');
const device = require('../../db/models/devices');

exports.createDevice = (req, data) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}addnewdevice`
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
        return reject(err)
      });
  })
}

// exports.activateDevice = (req, data) => {
//   return new Promise((resolve, reject) => {
//     let url = `${process.env.MAIN_BACKEND_API}reactivateDevice`
//     let config = {
//       headers: {
//         "Authorization": "Bearer " + req.header('outSideToken')
//       }
//     }
//     axios.post(url, data, config)
//       .then((response) => {
//         return resolve(response.data)
//       })
//       .catch((err) => {
//         return reject(err)
//       });
//   })
// }

exports.getList = (req) => {
  return new Promise((resolve, reject) => {
    let url = `${process.env.MAIN_BACKEND_API}device`;
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
        return reject(err)
      })
  })
}