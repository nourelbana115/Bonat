const channel = require('./channel');

const jobs = require('../Jobs/jobify');

const {cantAssertQueue,cantOpenChannel} = require('../Messages/errors');

const queue = "DefaultQueue";

const listen = () => {

    channel.then((ch) => {

        ch.assertQueue(queue,{ durable: true })
    
        .then((ok) => {
            ch.consume(queue,
                    (job) => {
                        if (job !== null) {

                            jobs.runJob(job.content.toString())

                            .then((done)=>ch.ack(job))

                            .catch((error) => {
                                ch.ack(job)
                                
                            })
                        }
                    },
                    {
                        noAck: false
                    }
                );
            })
        .catch((error) => cantAssertQueue(error)
        );
    
    }).catch((error) => cantOpenChannel(error));  
}

module.exports = {listen};
