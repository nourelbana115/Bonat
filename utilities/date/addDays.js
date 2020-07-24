const addDays = (days, date = '') => {
    date = (date)?new Date(date):new Date();
    date.setDate(date.getDate() + days);
    return date;
}

module.exports = addDays;