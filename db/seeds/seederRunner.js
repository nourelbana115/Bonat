const logger = require('../../services/logger');

const isValidseeder = (seeder) => {
    return (seeder.seederfile === null ||
            seeder.seederfile === "" || 
            seeder.data === null ||
            typeof seeder.data !== "object" )?"seederfile or data not valid":true;
}

const logErrors = (errors,seederName) => logger.log('general','error',errors,`running ${seederName}`);

const runSeeder = (seeder) => {
    
    return new Promise((resolve,reject) => {
        
        try {
       
            const seederStatus = isValidseeder(seeder);
            
            if(seederStatus !== true) throw seederStatus;
            
            const run = require(`./${seeder.seederfile}`);
     
            const result = run(seeder.data);
            
            result.then(success => {
               // console.log(success)
                resolve(success)
            })
            
            .catch((faild) => {

                logErrors(faild,seeder.seederfile);

                reject(faild);

            });
         
     
        } catch (error) {
             
            logErrors(error,seeder.seederfile);

            reject(error);
        }
    })
    
}

module.exports = {runSeeder};