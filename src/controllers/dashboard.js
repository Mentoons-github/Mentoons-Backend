const asyncHandler=require("../utils/asyncHandler")
const { errorResponse, successResponse } = require("../utils/responseHelper");
const dashboardHelper=require("../helpers/dashboardHelper")

module.exports = {
    getAnalytics: asyncHandler(async (req, res, next) => {
        const result = await dashboardHelper.getAnalytics();
        if (!result) {
           return errorResponse(res, 400, "Failed to fetch analytics");
        }
      successResponse(res, 200, "Analytics fetched successfully", result);
    }),
};
