const WorkshopData = require("../models/workshop");

module.exports = {
  saveFormToDB: async (
    name,
    age,
    guardianName,
    guardianContact,
    city,
    isMobileAddicted,
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
        appliedWorkshop,
      });
      const workshopFormData = await newWorkshopForm.save();
      return workshopFormData;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  },
};
