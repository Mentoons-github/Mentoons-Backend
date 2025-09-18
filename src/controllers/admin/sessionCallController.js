const asyncHandler = require("../../utils/asyncHandler");
const SessionModel = require("../../models/session");

const fetchSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const sessions = await SessionModel.find({ user: userId })
    .populate("user")
    .sort({ date: -1 });

  console.log(sessions);
  console.log(sessions.length);

  res.status(200).json(sessions);
});

const updateSession = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedSession = await SessionModel.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!updatedSession) {
    return res.status(404).json({ message: "Session not found" });
  }

  res.status(200).json({
    success: true,
    message: "Session updated successfully",
    data: updatedSession,
  });
});

module.exports = { fetchSessions, updateSession };
