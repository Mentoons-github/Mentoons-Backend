const { saveFormToDB, getDataFromDB } = require("../helpers/workshopHelper");
const asyncHandler = require("../utils/asyncHandler");
const messageHelper = require("../utils/messageHelper");
const { errorResponse, successResponse } = require("../utils/responseHelper");

module.exports = {
  submitWorkshopForm: asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const {
      name,
      age,
      guardianName,
      guardianContact,
      guardianEmail,
      city,
      mobileUsageHours,
      primaryActivityOnMobile,
      isTimeRestricted,
      restrictionType,
      concernsUser,
      behavioralChanges,
      physicalActivityHours,
      confessionFrequency,
      message,
      appliedWorkshop,
    } = req.body;
    if (
      !(
        name &&
        age &&
        guardianName &&
        guardianContact &&
        guardianEmail &&
        city &&
        mobileUsageHours &&
        primaryActivityOnMobile &&
        isTimeRestricted &&
        restrictionType &&
        concernsUser &&
        behavioralChanges &&
        physicalActivityHours &&
        confessionFrequency &&
        appliedWorkshop
      )
    ) {
      return errorResponse(res, 404, messageHelper.BAD_REQUEST);
    }

    const formData = await saveFormToDB(
      name,
      age,
      guardianName,
      guardianContact,
      guardianEmail,
      city,
      mobileUsageHours,
      primaryActivityOnMobile,
      isTimeRestricted,
      restrictionType,
      concernsUser,
      behavioralChanges,
      physicalActivityHours,
      confessionFrequency,
      message,
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
  getWorkshopFormData: asyncHandler(async (req, res, next) => {
    const {
      limit,
      skip,
      sort,
      city,
      age,
      mobileUsageHours,
      mobileUsageLevel,
      physicalActivityHours,
    } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (age) filter.age = age;
    if (mobileUsageHours) filter.mobileUsageHours = mobileUsageHours;
    if (mobileUsageLevel) filter.mobileUsageLevel = mobileUsageLevel;
    if (physicalActivityHours)
      filter.physicalActivityHours = physicalActivityHours;

    const data = await getDataFromDB(limit, skip, sort, filter);
    if (!data) {
      return errorResponse(
        res,
        500,
        "Something went wrong while retrieving the data"
      );
    }
    successResponse(res, 200, "workshop data fetched successfully!", data);
  }),
};
