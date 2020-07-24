const getDay = (today = '') =>{
    today = (today)?new Date(today):new Date();
    return `${today.getFullYear()}-${(today.getMonth()+1)}-${today.getDate()}`;
}
module.exports = getDay;