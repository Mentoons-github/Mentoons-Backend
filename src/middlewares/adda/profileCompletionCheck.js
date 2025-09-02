const User = require("../../models/user");
const { errorResponse } = require("../../utils/responseHelper");

const checkProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.dbUser._id;

    console.log("user Id :", userId);

    const user = await User.findById(userId);

    if (!user) {
      console.log("❌  User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const requiredFields = [
      "name",
      "email",
      "phoneNumber",
      "location",
      "dateOfBirth",
      "gender",
    ];

    const incompleteFields = requiredFields.filter((field) => {
      const value = user[field];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    });

    if (incompleteFields.length > 0) {
      console.log(
        "🔴  Incomplete profile. Missing:",
        JSON.stringify(incompleteFields)
      );
      return res.status(403).json({
        message: "Complete your profile before posting.",
        missingFields: incompleteFields,
      });
    }
    console.log("completed");
    next();
  } catch (error) {
    console.log(error);
    return errorResponse(res, 401, "Invalid or expired token.");
  }
};

module.exports = checkProfileCompletion;
