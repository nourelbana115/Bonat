const cron = require("node-cron");

const {Job} = require('../db/models/Jobs');

const queue = require('./QueuingServices/queue');

const logger = require('./logger');

const {date} = require('../utilities');

const getJobs = (query) => {

    return new Promise((resolve,reject) => {

        Job.find(query).sort({priority:1})

        .then(jobs => resolve(jobs))

        .catch(error => reject(error));
    })

}

const updateRunJobsDate = (jobs) =>{
    return new Promise((resolve,reject) => {
        jobs = jobs.map(({_id}) => _id);
        Job.updateMany({_id:{$in:jobs}},{updatedAt:new Date()})
        .then(jobs => resolve(jobs))
        .catch(error => reject(error));
    })
}

const dispatchJobs = (jobs) => {
    
    updateRunJobsDate(jobs)

    .then(updatedjobs => {

        jobs.forEach(job => {
            queue.publisher.dispatch(
            {
                jobfile:job.jobfile,
                data:job.data || {}
            });
        });
    })

    .catch(error => logger.log('general','error',error,`running cronJob Services update date`))
    
}

const moveToNext = (jobUdatedAt) => {
    return date.addHours(20,jobUdatedAt) > new Date()?true:false;
}

const getCurrentPriority = (prioritizeJobs) => {
    for (job of prioritizeJobs){
        if(!moveToNext(job.updatedAt)) return job.priority;
    }
    return 0;
}

const calculatePriority = (jobs) =>{

    const prioritizeJobs = jobs.reduce((pJobs,currentJob) =>{
        const existJobs = pJobs.filter(pJob => pJob.priority == currentJob.priority);
        if(!existJobs.length)pJobs.push(currentJob);
        return pJobs;
    },[]).sort((oj,nj) => oj.priority - nj.priority);
    
    const currentPriority = getCurrentPriority(prioritizeJobs);
   
    return jobs.filter(job => job.priority == currentPriority);
}

const dispatchDaily = () => {

    getJobs({runOn:'daily'})

    .then(jobs => {
        const currentJobs = calculatePriority(jobs);
        if(currentJobs.length)dispatchJobs(currentJobs);
    })

    .catch(error => logger.log('general','error',error,`running cronJob Services`))
}

const dispatchHourly = () => {

    getJobs({runOn:'hourly'})

    .then(jobs => dispatchJobs(jobs))

    .catch(error => logger.log('general','error',error,`running cronJob Services`))
}

const schedule = () =>{
    cron.schedule("*/59 * * * *",  () => dispatchDaily())
    cron.schedule("59 * * * *",  () => dispatchHourly())
}

module.exports = {schedule};

