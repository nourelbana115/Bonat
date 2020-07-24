const chai = require('chai');
const chaiCron = require('chai-cron');

const { expect } = chai;

chai.use(chaiCron);
describe('testing cron',()=>{
    it('should pass ',(done)=>{
        expect("59 23 * * *").to.be.cron();
        expect("59 23 * * *").to.be.cronTime();
        expect("59 23 * * *").to.be.a.cronExpression();
        expect("59 23 * * *").to.be.a.cronTimeExpression();
        done();
    })
})
