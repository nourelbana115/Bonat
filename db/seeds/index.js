const {runSeeder} = require('./seederRunner');

const seeders = [
    {
        seederfile:'jobsSeeder',
        data:{}
    },
    {
        seederfile:'merchantDefaultSegmentsSeeder',
        data:{}
    }
];

const runSeeders = () => seeders.forEach(seeder => runSeeder(seeder));


runSeeders();
