const calculateIncentiveAmount = (sourceType, sourceDetails) => {
  switch (sourceType) {
    case "WORKSHOP_BATCH":
      return workshopIncentive(sourceDetails);
    default:
      return null;
  }
};

const workshopIncentive = (sourceDetails) => {
  const incentiveData = {
    1: {
      "6-12": 500,
      "13-19": 750,
    },
    3: {
      "6-12": 1000,
      "13-19": 1500,
    },
    6: {
      "6-12": 2000,
      "13-19": 3000,
    },
    12: {
      "6-12": 4000,
      "13-19": 6000,
    },
  };

  const durationData = incentiveData[sourceDetails.duration];
  if (!durationData) throw new Error("Invalid duration");

  const ageGroup = sourceDetails.age;
  const amount = durationData[ageGroup];

  if (!amount) throw new Error("No incentive amount found");

  return amount;
};

module.exports = { calculateIncentiveAmount };
