const stringTOJson = (stringVal) => {
    try {
       return JSON.parse(stringVal);
    } catch (error) {
        return stringVal;
    }
}

module.exports = stringTOJson;