const Incentive = require("../../models/employee/incentive");
const Plans = require("../../models/workshop/plan");

const assignIncentive = async (employeeId, sourceType, sourceId) => {
  if (!["WORKSHOP_BATCH", "SESSION"].includes(sourceType)) {
    throw new Error(`INVALID SOURCE TYPE : ${sourceType}`);
  }

  let sourceDetails;

  switch (sourceType) {
    case "WORKSHOP_BATCH":
      sourceDetails = await Plans.findOne({ planId: sourceId });
      break;
    default:
      throw new Error(`UNHANDLED SOURCE TYPE: ${sourceType}`);
  }

  if (!sourceDetails) throw new Error(`${sourceType} not found`);

  await Incentive.create({
    employee: employeeId,
    sourceId,
    sourceType,
    status: "PENDING",
    incentiveAmount: calculateIncentiveAmount(sourceType, sourceDetails),
  });
};

module.exports = assignIncentive;
