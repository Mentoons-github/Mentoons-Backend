const BplVerification = require("../../models/workshop/bplVerificationModel");

const bplVerificationFormsubmit = async (userId, details) => {
  if (!userId) {
    throw new Error("User not found");
  }
  const rationCard = details.rationCardNumber.toUpperCase();
  const existing = await BplVerification.findOne({
    rationCardNumber: rationCard,
    status: { $ne: "Rejected" },
  });
  if (existing) {
    throw new Error("This ration card has already been submitted.");
  }
  await BplVerification.create({
    user: userId,
    rationCardNumber: rationCard,
    headOfFamilyName: details.headOfFamilyName,
    mobileNumber: details.mobileNumber,
    state: details.state,
    district: details.district,
    document: details.document,
  });

  return "BPL verification form successfully submitted.";
};

// check applied
const checkApplied = async (userId) => {
  if (!userId) {
    throw new Error("User not found");
  }

  const existing = await BplVerification.findOne({
    user: userId,
  });

  if (!existing) {
    return;
  }
  return existing;
};

//getAllBplApplication
const getAllBplApplication = async (
  userId,
  {
    search = "",
    sortField = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
    filter = {},
  },
) => {
  if (!userId) {
    throw new Error("User not found");
  }

  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(search, "i");

  const query = {
    ...filter,
  };

  if (search) {
    query.$or = [
      {
        rationCardNumber: { $regex: searchRegex },
      },
      {
        headOfFamilyName: { $regex: searchRegex },
      },
      { state: { $regex: searchRegex } },
      { state: { $regex: searchRegex } },
    ];
  }

  const applications = await BplVerification.find(query)
    .sort({ [sortField]: sortOrder === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(limit);

  const total = await BplVerification.countDocuments(query);
  return {
    data: applications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

//update application status
const updateApplicationStatus = async (userId, data) => {
  if (!userId) {
    throw new Error("User not found");
  }
  const application = await BplVerification.findByIdAndUpdate(
    data.applicationId,
    { status: data.status },
    { new: true },
  );
  return application;
};

//delete application
const deleteBplApplication = async (userId, applicationId) => {
  if (!userId) {
    throw new Error("User not found");
  }

  if (!applicationId) {
    throw new Error("Application not found");
  }

  await BplVerification.findByIdAndDelete(applicationId);
};

module.exports = {
  bplVerificationFormsubmit,
  checkApplied,
  getAllBplApplication,
  updateApplicationStatus,
  deleteBplApplication,
};
