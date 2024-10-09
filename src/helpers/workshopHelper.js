const WorkshopData = require("../models/workshop");

module.exports = {
  saveFormToDB: async (
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
  ) => {
    try {
      const mobileUsageLevel =
        mobileUsageHours < 2
          ? "LOW"
          : mobileUsageHours <= 4 && mobileUsageHours >= 2
          ? "MEDIUM"
          : "HIGH";
      const physicalActivityFrequency =
        physicalActivityHours < 2
          ? "LOW"
          : physicalActivityHours <= 4 && physicalActivityHours >= 2
          ? "MEDIUM"
          : "HIGH";
      const newWorkshopForm = new WorkshopData({
        name,
        age,
        guardianName,
        guardianContact,
        guardianEmail,
        city,
        mobileUsageHours,
        mobileUsageLevel,
        primaryActivityOnMobile,
        isTimeRestricted,
        restrictionType,
        concernsUser,
        behavioralChanges,
        physicalActivityHours,
        physicalActivityFrequency,
        confessionFrequency,
        message,
        appliedWorkshop,
      });
      const workshopFormData = await newWorkshopForm.save();
      return workshopFormData;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
  getDataFromDB: async (limit, skip, sort, filter) => {
    const parsedLimit = parseInt(limit, 10) || 0;
    const parsedSkip = parseInt(skip, 10) || 0;
    const parsedSort = sort == "asc" ? 1 : -1;
    try {
      const data = await WorkshopData.find(filter)
        .limit(parsedLimit)
        .skip(parsedSkip)
        .sort({ createdAt: parsedSort });
      return data;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  },
};
