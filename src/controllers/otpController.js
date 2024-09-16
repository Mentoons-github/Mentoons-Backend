const { saveOTPToDB, validateOtp } = require('../helpers/otpHelpers')
const whatsappMessage = require('../services/twillioWhatsappService')
const asyncHandler = require('../utils/asyncHandler')
const { hashData, createOtp } = require('../utils/functions')
const messageHelper = require('../utils/messageHelper')
const { errorResponse, successResponse } = require('../utils/responseHelper')



module.exports = {

    getOtp: asyncHandler(async (req, res, next) => {
        const { phone, countryCode } = req.body
        if (!phone && !countryCode) {
            errorResponse(res, 404, messageHelper.BAD_REQUEST)
        }
        const phoneNo = `${countryCode}${phone}`
        const otp = await createOtp()
        const hashedOtp = await hashData(otp)
        await saveOTPToDB({ phone, countryCode, otp: hashedOtp });
        console.log(whatsappMessage(`Your 6 digit OTP is: ${otp}`, phoneNo));
        
        
        successResponse(res, 200, messageHelper.OTP_SENT_SUCCESSFULLY)
    }),

    verifyOtp: asyncHandler(async (req, res, next) => {
        const { phone, countryCode, otp } = req.body;
        if (!phone || !countryCode || !otp) {
            return errorResponse(res, 400, messageHelper.BAD_REQUEST);
        }
        const isValid = await validateOtp(phone,countryCode,otp)
        if (!isValid) {
            return errorResponse(res, 400, messageHelper.INVALID_OTP);
        }
        return successResponse(res, 200,messageHelper.OTP_VERIFIED);
    }),
};
