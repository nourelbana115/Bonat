const connection = require('./connector');

const logger = require('../../logger');

const channel = connection.then((con) => con.createChannel())

.catch((error)=>logger.log('connections','error',error,'rabbitMQ'));

module.exports = channel;
