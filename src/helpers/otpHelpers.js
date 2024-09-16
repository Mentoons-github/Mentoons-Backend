const OTP = require('../models/otp');
const { verifyData } = require('../utils/functions');
const messageHelper = require('../utils/messageHelper');

module.exports = {
    saveOTPToDB: async ({ phone, countryCode, otp }) => {
        try {
            await OTP.findOneAndDelete({ phone, countryCode });
            const otpRecord = new OTP({ phone, countryCode, otp });
            const saved = await otpRecord.save();
            return saved;
        } catch (error) {
            console.log(error)
            throw new Error("Error saving OTP")
        }
    },
    validateOtp: async (phone, countryCode, otp) => {
        try {
            const otpRecord = await OTP.findOne({ phone, countryCode });
            if (!otpRecord) {
                throw new Error(messageHelper.OTP_NOT_FOUND)
            }
            const isOtpValid = await verifyData(otp,otpRecord.otp);
            return isOtpValid;
        } catch (error) {
            console.log(error)
            throw new Error("Error validating OTP")
        }
    }
}   