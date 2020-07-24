const channel = require('./channel');

const queue = "DefaultQueue";

const {cantAssertQueue,cantOpenChannel} = require('../Messages/errors');

const dispatch = (job) => {

  channel.then( (ch) => {

    ch.assertQueue(queue,{ durable: true })
  
    .then((ok) => {

      return ch.sendToQueue(queue,

      Buffer.from(JSON.stringify(job)),

      { persistent: true});
      
    })
  
    .catch((error)=>cantAssertQueue(error));
  
  })

  .catch((error)=>cantOpenChannel(error));
  
}

module.exports = {dispatch};