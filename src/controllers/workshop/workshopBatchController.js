const workshopBatch = require("../../models/workshop/workshopBatch");
const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/responseHelper");

const {
  getAllWorkshopBatchesHelper,
  assignWorkshopBatch,
  getWorkshopBatchesByPsychologist,
  getSingleWorkshopBatchHelper,
  addWorkshopScoringHelper,
  updateWorkshopScoringHelper,
} = require("../../helpers/workshop/workshopBatchHelpers");

//get all workshopbatchs
const getAllWorkshopBatches = asyncHandler(async (req, res) => {
  const { search, sort, filter, page = 1, limit = 12 } = req.query;

  const batches = await getAllWorkshopBatchesHelper({
    search,
    sort,
    filter,
    page,
    limit,
  });
  return successResponse(res, 200, "Data retrieved successfully", batches);
});

//get single workshop batches
const getSingleWorkshopBatch = asyncHandler(async (req, res) => {
  const { workshopBatchId } = req.params;
  const batch = await getSingleWorkshopBatchHelper(workshopBatchId);
  return successResponse(res, 200, "Data retrieved successfully", batch);
});

//assign batces
const assignWorkshopBatchtoPsychologist = asyncHandler(async (req, res) => {
  const { psychologistId, startDate, workshopBatchId } = req.body;
  if (!workshopBatchId) {
    res.status(400).json({ message: "Workshop batch id is required" });
  }
  if (!psychologistId || !startDate) {
    res
      .status(400)
      .json({ message: "psychologistId and startDate is required" });
  }
  const updated = await assignWorkshopBatch(
    workshopBatchId,
    psychologistId,
    startDate,
  );
  return successResponse(
    res,
    201,
    "Workshop Batch successfully assigned to psychologist",
    updated,
  );
});

//get psychologist batches
const getSinglePsychologistWorkshopBatches = asyncHandler(async (req, res) => {
  const { search, sort, filter, page = 1, limit = 12 } = req.query;
  const userId = req.user._id;
  const batches = await getWorkshopBatchesByPsychologist(
    userId,
    search,
    sort,
    filter,
    page,
    limit,
  );
  return successResponse(res, 200, "Data retrieved successfully", batches);
});

// add workshop scoring
const addWorkshopScoring = asyncHandler(async (req, res) => {
  const { sutudentId } = req.params;
  const userId = req.user._id;
  const sessionScore = req.body;

  const student = await addWorkshopScoringHelper(
    sutudentId,
    userId,
    sessionScore,
  );

  return successResponse(
    res,
    201,
    "Scoring successfully added on student details",
    student,
  );
});

// add workshop scoring
const updateWorkshopScoring = asyncHandler(async (req, res) => {
  const { sutudentId, sessionId } = req.params;
  const userId = req.user._id;
  const sessionScore = req.body;

  const student = await updateWorkshopScoringHelper(
    sutudentId,
    sessionId,
    userId,
    sessionScore,
  );

  return successResponse(
    res,
    201,
    "Scoring successfully added on student details",
    student,
  );
});

module.exports = {
  getAllWorkshopBatches,
  getSingleWorkshopBatch,
  assignWorkshopBatchtoPsychologist,
  getSinglePsychologistWorkshopBatches,
  addWorkshopScoring,
  updateWorkshopScoring,
};
