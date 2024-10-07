const { whatsappHelperFunc } = require("../helpers/whatsappHelper");
const asyncHandler = require("../utils/asyncHandler");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  comicWhatsappController: asyncHandler(async (req, res, next) => {
    const { number } = req.body;

    if (!number) {
      throw new Error("Number is a required field");
    }

    if (!/^\+91\d{10}$/.test(number)) {
      throw new Error(
        "Invalid phone number format. Add your country code ex: India - (+91)"
      );
    }
    const status = await whatsappHelperFunc(number);
    if (!status) {
      return errorResponse(
        res,
        500,
        "Something went wrong while sending free comic!"
      );
    }
    successResponse(res, 200, "WhatsApp message sent successfully");
  }),
};
