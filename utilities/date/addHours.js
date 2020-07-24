const addHours = (hours, date = '') => {
    date = (date)?new Date(date):new Date();
    date.setHours(date.getHours() + hours);
    return date;
}

module.exports = addHours;