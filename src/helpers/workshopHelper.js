const WorkshopData = require("../models/workshop");

module.exports = {
  saveFormToDB: async (
    name,
    age,
    guardianName,
    guardianContact,
    city,
    isMobileAddicted,
    mobileUsageHours,
    message,
    appliedWorkshop
  ) => {
    try {
      const newWorkshopForm = new WorkshopData({
        name,
        age,
        guardianName,
        guardianContact,
        city,
        isMobileAddicted,
        mobileUsageHours,
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
  getDatafromDB: async (limit, skip, sort) => {
    const parsedLimit = parseInt(limit, 10) || 0;

    try {
      const data = await WorkshopData.find({}).limit(parsedLimit);
      return data;
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  },
};
