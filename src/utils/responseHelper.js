module.exports ={
    successResponse(res, statusCode, message, data = null) {
        res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    },
    errorResponse(res, statusCode, errorMessage) {
        res.status(statusCode).json({
            success: false,
            error: errorMessage,
        });
    },
     createError(statusCode, message) {
        const error = new Error(message);
        error.statusCode = statusCode;
        return error;
    },
}