const fs = require('fs');
const path = require('path');

const domains = ['connections', 'requests','general'];
const flags = ['error', 'info', 'debug'];
const connections = ['mongoDB', 'redis', 'rabbitMQ'];
const baseLogPath = '../logs/';

const createFilePath = (filePath) => path.join(__dirname, `${baseLogPath}${filePath}`);

const errorHandler = (message) => {
  log('general','error',message,"Logger Module");
}

// get today date
const getTodayDate = () => {
  let nowDate = new Date();
  return `${nowDate.getDate()}-${(nowDate.getMonth()+1)}-${nowDate.getFullYear()}`;
}
7
// check if directory exists or create it
const createDirectory = (direcotry) => {
  fs.existsSync(createFilePath(direcotry)) || fs.mkdirSync(createFilePath(direcotry));
}

const createDirectoryPath = (domain, flag) => {
  createDirectory(domain);
  createDirectory(`${domain}/${flag}`);
}

// create log path
const createLogPath = (domain, flag, todayDate) => {
  const currentDomain = domains.includes(domain);
  const currentFlag = flags.includes(flag);
  if (currentDomain && currentFlag) return createFilePath(`${domain}/${flag}/${todayDate}.log`)
  return false;
}

// check connection type
const checkConnectionType = (domain, connection) => {
  if(domain == 'connections') {
    const currentConnection = connections.includes(connection);
    return currentConnection ? true : false;
  }
  return true;
}
const writeErrorMessage = (error) => {
  try {

    const stringObject = JSON.parse(error);

    return stringObject; 

  } catch (err) {
    return error;
  }
}
// create log file
const log = (domain, flag, response, source) => {
  const filePath = createLogPath(domain, flag, getTodayDate());
  if(filePath && checkConnectionType(domain, source)) {
    createDirectoryPath(domain, flag);
    fs.appendFileSync(filePath, new Date + ' Source: ' + source + ' Response: ' + writeErrorMessage(response) + '\n');
  } else {
    errorHandler('Your log failed, please check your domain, flag and source');
  }
}

// exports
module.exports = { log }