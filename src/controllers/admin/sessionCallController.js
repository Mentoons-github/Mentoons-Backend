const asyncHandler = require("../../utils/asyncHandler");
const SessionModel = require("../../models/session");

const fetchSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sessions = await SessionModel.find({ user: userId })
    .populate("user")
    .sort({ date: -1 });

  res.status(200).json(sessions);
});

module.exports = { fetchSessions };
