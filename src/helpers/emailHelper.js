const Email = require("../models/email");

module.exports = {
  saveEmailToDB: async (email) => {
    try {
      const enquiry = new Email(email);
      const saveEmail = await enquiry.save();
      console.log(saveEmail);
      return saveEmail;
    } catch (error) {
      console.log(error);
      throw new Error("Error saving email : ", error);
    }
  },
  getLeadsFromDB: async () => {
    try {
      const users = await Email.find({});
      return users;
    } catch (error) {
      console.log(error);
      throw new Error("Data cannot be found");
    }
  },
};
