const {Job} = require('../models/Jobs');

const addjob = (job) => {
   
    return new Promise((resolve,reject) => {
       
        Job.find({ jobfile:job.jobfile, runOn:job.runOn})

        .then(jobs => {
            if(!jobs.length){

                const newJob = new Job(job);

                newJob.save()

                .then(savedJob => resolve(savedJob))

                .catch(error => reject(error))

            }else{
                resolve("job already exist");
            }
        })

        .catch(error => reject(error))

    });
  
}
// add object here in data 

const removeOldJobs = (jobs) => {
   
    return new Promise((resolve,reject) => {
       
        const jobsFileName = jobs.map(({jobfile}) =>jobfile);
        
        Job.deleteMany({ jobfile:{$not:{$in:jobsFileName}}})

        .then(jobsToRemove => resolve(jobsToRemove))

        .catch(error => reject(error))

    });
  
}
// add object here in data 
const jobs = [
    {
        jobfile:"segmentsUpdateDailyJob",
        data:{},
        runOn:"daily",
        priority:1
    },
    {
        jobfile:"saveReturnAndNewCustomersJob",
        data:{},
        runOn:"daily",
        priority:2
    },
    {
        jobfile:"sendGiftsDailyDispatcherJob",
        data:{},
        runOn:"daily",
        priority:2
    },
    {
        jobfile:"saveCustomersFeedbackJob",
        data:{},
        runOn:"daily",
        priority:3
    },
    {
        jobfile:"saveGiftStatisticsToDbJob",
        data:{},
        runOn:"daily",
        priority:3
    },
    {
        jobfile:"unpublishExpiredCouponsJob",
        data:{},
        runOn:"daily",
        priority:4
    },
    {
        jobfile:"updateMerchantDataJob",
        data:{},
        runOn:"daily",
        priority:1
    },
    {
        jobfile:"saveDashboardInsightsJob",
        date:{},
        runOn:"daily",
        priority:4
    },
    {
        jobfile:"saveDashboardChartJob",
        date:{},
        runOn:"daily",
        priority:4
    },
    {
        jobfile:"saveDashboardBranchInsightsJob",
        date:{},
        runOn:"daily",
        priority:4
    },
    {
        jobfile:"saveDashboardBranchChartJob",
        date:{},
        runOn:"daily",
        priority:4
    },
    {
        jobfile:"saveCouponStatsJob",
        date:{},
        runOn:"daily",
        priority:4
    }
];

const run = async (data) => {
    
    const removedJobs = await removeOldJobs(jobs);
    
    if(!removedJobs) return Promise.reject("we can't remove older jobs, jobsSeeder");

    createdJobs = jobs.map(job => addjob(job));
    
    const result = await Promise.all(createdJobs);
    
    return result;
}


module.exports = run;