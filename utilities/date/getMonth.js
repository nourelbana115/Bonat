const getMonth = (today = '') =>{
    today = (today)?new Date(today):new Date();
    return `${(today.getMonth()+1)}`;
}
module.exports = getMonth;