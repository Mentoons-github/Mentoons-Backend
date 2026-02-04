const UserPlan = require("../../models/workshop/userPlan");
const Batch = require("../../models/workshop/workshopBatch");
const assignIncentive = require("../payment/incentive.service");

const fetchUserPlan = async (_id, userId) => {
  const userPlan = await UserPlan.findOne({ _id, userId });
  if (!userPlan) {
    return errorResponse(res, 404, "User plan not found");
  }

  return userPlan;
};

const completeExpiredBatches = async () => {
  const now = new Date();

  const expiredBatches = await Batch.find({
    status: { $ne: "completed" },
    endDate: { $lte: now },
  });

  for (const batch of expiredBatches) {
    batch.status = "completed";
    await batch.save();

    await assignIncentive(batch.psychologist, "WORKSHOP_BATCH", batch._id);
  }

  console.log(`✅ Completed ${expiredBatches.length} batches`);
};

module.exports = { fetchUserPlan, completeExpiredBatches };
