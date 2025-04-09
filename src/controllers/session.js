const SessionModel = require("../models/session");
const User = require("../models/user");

const getUserSession = async (req, res) => {
  try {
    const userClerkId = req.user.id;

    const user = await User.findOne({ clerkId: userClerkId });

    const existingSession = await SessionModel.findOne({
      user: user._id,
    }).populate("user");
    if (existingSession.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No session found",
      });
    }

    return res.status(200).json({ success: true, session: existingSession });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUserSession,
};
