const amqp = require('amqplib');

const {connectionUrl} = require('./config');

const logger = require('../../logger');

const connection = amqp.connect(connectionUrl);

connection.then((con) => con)

.catch((error) => logger.log('connections','error',error,'rabbitMQ'));

module.exports = connection

