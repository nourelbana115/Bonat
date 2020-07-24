const logger = require('../../logger')

const isValidJob = (job) => {
    return (job.jobfile === null ||
            job.jobfile === "" || 
            job.data === null ||
            typeof job.data !== "object" )?"jobfile or data not valid":true;
}

const logErrors = (errors,jobName) => logger.log('general','error',errors,`running ${jobName}`);

const runSingleJob = (job) => {
    return new Promise((resolve,reject) => {
        
        try {
       
            const jobStatus = isValidJob(job);
            
            if(jobStatus !== true) throw jobStatus;
            
            const run = require(`./${job.jobfile}`);
     
            const result = run(job.data);
            
            result.then(success => {
                //console.log(success)
                resolve(success)
            })
            
            .catch((faild) => {
                //console.log(faild);
                logErrors(faild,job.jobfile);

                reject(faild);

            });
         
     
        } catch (error) {
           
            logErrors(error,job.jobfile);

            reject(error);
        }
    })
}

const runJob = async(job) => {

    try {
       
        job = JSON.parse(job);

        const jobs = (Array.isArray(job))?job:[job];
        
        for(let jobToRun of jobs){
            await runSingleJob(jobToRun);
        }
       
        return Promise.resolve(true);

    } catch (error) {
        return Promise.reject(error);
    }

}



module.exports = {runJob};