const messageHelper = require("../utils/messageHelper");
const { errorResponse } = require("../utils/responseHelper");

const errorHandler = (err, req, res, next) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    const message = err.message || messageHelper.INTERNAL_SERVER_ERROR;
    errorResponse(res, statusCode, message);
};

module.exports = errorHandler;