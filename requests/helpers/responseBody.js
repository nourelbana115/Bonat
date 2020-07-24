const generalResponse = (data = {}, errors = [], message = "", isNew = false) => {

    return {
        data: data,
        errors: errors,
        message: message,
        isNew: isNew
    };
}

module.exports = { generalResponse };

