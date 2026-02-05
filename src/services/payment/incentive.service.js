const Incentive = require("../../models/employee/incentive");
const Plans = require("../../models/workshop/plan");
const Batch = require("../../models/workshop/workshopBatch");
const {
  calculateIncentiveAmount,
} = require("../../helpers/employee/incentive.helper");

const assignIncentive = async (employeeId, sourceType, sourceId) => {
  if (!["WORKSHOP_BATCH", "SESSION"].includes(sourceType)) {
    throw new Error(`INVALID SOURCE TYPE: ${sourceType}`);
  }

  let sourceDetails;

  switch (sourceType) {
    case "WORKSHOP_BATCH":
      const batch = await Batch.findById(sourceId);
      sourceDetails = await Plans.findOne({ planId: batch.workshopId });
      break;
    case "SESSION":
      sourceDetails = {}; 
      break;
    default:
      throw new Error(`UNHANDLED SOURCE TYPE: ${sourceType}`);
  }

  if (!sourceDetails) throw new Error(`${sourceType} not found`);

  const totalIncentive = calculateIncentiveAmount(sourceType, sourceDetails);

  let initialPaymentDate = new Date();
  let finalPaymentDate = null;

  if (sourceType === "WORKSHOP_BATCH") {
    const durationMonths = sourceDetails.durationMonths || 1;
    finalPaymentDate = new Date(initialPaymentDate);
    finalPaymentDate.setMonth(finalPaymentDate.getMonth() + durationMonths);
  }

  const incentiveData = {
    employee: employeeId,
    sourceId,
    sourceType,
    totalIncentiveAmount: totalIncentive,
    initialPaymentAmount:
      sourceType === "WORKSHOP_BATCH"
        ? Math.floor(totalIncentive / 2)
        : totalIncentive,
    finalPaymentAmount:
      sourceType === "WORKSHOP_BATCH"
        ? totalIncentive - Math.floor(totalIncentive / 2)
        : null,
    initialPaymentDate,
    finalPaymentDate,
    status: "PENDING",
  };

  await Incentive.create(incentiveData);
};

module.exports = { assignIncentive };
