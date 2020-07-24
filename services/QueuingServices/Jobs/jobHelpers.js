const path = require('path');

const getCurrentJobName = (fileName) => path.basename(fileName);

module.exports = {getCurrentJobName};