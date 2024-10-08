const { saveFormToDB } = require("../helpers/workshopHelper");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  submitWorkshopForm: asyncHandler(async (req, res, next) => {
    // const { name,
    //     guardianName,
    //     guardianContact,
    //     city,
    //     message,
    //     appliedWorkshop,
    //     age } = req.body

    // if (!name && !guardianName && !guardianContact && !city && !message && !appliedWorkshop && !age) {
    //     return errorResponse(res, 404, messageHelper.BAD_REQUEST)
    // }
    // const newForm = await saveFormToDB(name,
    //     guardianName,
    //     guardianContact,
    //     city,
    //     message,
    //     appliedWorkshop.toUpperCase(),
    //     age)
    // if(!newForm){
    //     return errorResponse(res,404,messageHelper.INTERNAL_SERVER_ERROR)
    // }
    // successResponse(res,200,messageHelper.FORM_SUBMITTED,newForm)

    const {
      name,
      age,
      guardianName,
      guardianContact,
      city,
      isMobileAddicted,
      appliedWorkshop,
    } = req.body;

    if (
      !(name && age && guardianName,
      guardianContact,
      city,
      isMobileAddicted,
      appliedWorkshop.toUpperCase())
    ) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }

    const formData = await saveFormToDB(
      name,
      age,
      guardianName,
      guardianContact,
      city,
      isMobileAddicted,
      appliedWorkshop
    );
    console.log(formData);

    if (!formData) {
      errorResponse(
        res,
        500,
        "Something went wrong while saving workshop form"
      );
    }

    successResponse(res, 200, messageHelper.FORM_SUBMITTED, formData);
  }),
};
