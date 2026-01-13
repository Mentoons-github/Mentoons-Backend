const asyncHandler = require("../../utils/asyncHandler");
const Employee = require("../../models/employee/employee");
const {
  successResponse,
  errorResponse,
} = require("../../utils/responseHelper");
const DataCapture = require("../../models/employee/dataCaptureModel");

// create data capture
const createDataCapture = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const dataCaptureData = req.body;
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }
  const dataCapture = await DataCapture.create({
    psychologist: employee._id,
    ...dataCaptureData,
  });
  return successResponse(
    res,
    201,
    "Data capture created successfully",
    dataCapture
  );
});

//edit datacapture
const editDataCapture = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { dataCaptureId } = req.params;
  const dataCaptureData = req.body;
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }
  const dataCapture = await DataCapture.findByIdAndUpdate(
    dataCaptureId,
    {
      demographic: dataCaptureData.demographic,
      developmental: dataCaptureData.developmental,
      academic: dataCaptureData.academic,
      familyEnvironmental: dataCaptureData.familyEnvironmental,
      behaviouralEmotional: dataCaptureData.behaviouralEmotional,
      ScreenAndDigitalAddication: dataCaptureData.ScreenAndDigitalAddication,
      otherAddictionPattern: dataCaptureData.otherAddictionPattern,
      childsSelfPerception: dataCaptureData.childsSelfPerception,
      goalsAndExpectations: dataCaptureData.goalsAndExpectations,
      therapistInitialObservation: dataCaptureData.therapistInitialObservation,
    },
    { new: true }
  );
  return successResponse(
    res,
    201,
    "Data capture edit successfull",
    dataCapture
  );
});

// feth datacapture details
const fetchDataCaptureDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;

  const search = req.query.search?.toString().trim();

  const filter = {
    psychologist: employee._id,
  };

  if (search) {
    filter.$or = [
      { "demographic.child.name": { $regex: search, $options: "i" } },
      {
        "demographic.guardians.fathersName": { $regex: search, $options: "i" },
      },
      {
        "demographic.guardians.mothersName": { $regex: search, $options: "i" },
      },
    ];
  }

  const [data, total] = await Promise.all([
    DataCapture.find(filter)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "psychologist",
        select: "_id",
        populate: {
          path: "user",
          select: "name email phoneNumber",
        },
      }),

    DataCapture.countDocuments(filter),
  ]);

  return successResponse(res, 200, "Data capture fetched successfully", {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// fetch single data capture detials
const fetchSingleDataCaptureDetails = asyncHandler(async (req, res) => {
  const { dataCaptureId } = req.params;
  const userId = req.user._id;
  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }
  const dataCaptureDetails = await DataCapture.findOne({
    psychologist: employee._id,
    _id: dataCaptureId,
  }).populate({
    path: "psychologist",
    select: "_id",
    populate: {
      path: "user",
      select: "name email phoneNumber",
    },
  });

  return successResponse(
    res,
    200,
    "Data capture fetched successfully",
    dataCaptureDetails
  );
});

//add review
const addReviewOnDataCapture = asyncHandler(async (req, res) => {
  const { dataCaptureId } = req.params;
  const userId = req.user._id;
  const reviewData = req.body;

  console.log(reviewData, "reviewwww");

  const employee = await Employee.findOne({ user: userId });
  if (!employee) {
    return errorResponse(res, 404, "Employee not found");
  }
  const review = await DataCapture.findByIdAndUpdate(
    dataCaptureId,
    { reviewMechanism: reviewData },
    { new: true }
  );

  return successResponse(
    res,
    201,
    "Review successfully added on data capture details",
    review
  );
});

module.exports = {
  createDataCapture,
  fetchDataCaptureDetails,
  fetchSingleDataCaptureDetails,
  addReviewOnDataCapture,
  editDataCapture,
};
