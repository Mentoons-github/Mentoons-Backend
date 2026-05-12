const asyncHandler = require("../utils/asyncHandler");
const {
  uploadFile,
  uploadFileToMentorMahesh,
} = require("../services/FileUpload");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");
const uploadFileController = asyncHandler(async (req, res) => {
  console.log("📥 Incoming file upload request");
  console.log("➡️ Query params:", req.query);

  const isContestUpload = req.query.contest === "true";
  console.log("📌 Is Contest Upload:", isContestUpload);

  if (!req.file) {
    console.log("❌ No file found in request");
    return errorResponse(res, 400, "No file uploaded");
  }

  console.log("📄 Received File:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  const MAX_FILE_SIZE = 200 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "video/mp4",
    "audio/mpeg",
    "application/json",
  ];

  if (req.file.size > MAX_FILE_SIZE) {
    console.log("❌ File too large:", req.file.size);
    return errorResponse(
      res,
      400,
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    console.log("❌ Unsupported MIME Type:", req.file.mimetype);
    return errorResponse(res, 400, "Unsupported file type");
  }

  let userId = null;

  if (!isContestUpload) {
    console.log("🔐 Auth upload detected. Checking user...");
    userId = req.auth?.userId;

    if (!userId) {
      console.log("❌ Auth missing when required for regular upload");
      return errorResponse(res, 401, "Unauthorized upload");
    }

    console.log("👤 Upload by user:", userId);
  } else {
    console.log("🟦 Contest upload - no auth required");
  }

  const { buffer: fileBuffer, mimetype, originalname } = req.file;

  console.log("📤 Uploading file to storage...");
  console.log({
    bucket: "OpinionJournal",
    mimetype,
    originalname,
    fileSize: req.file.size,
  });

  try {
    const uploadResult = await uploadFile(
      fileBuffer,
      "OpinionJournal",
      mimetype,
      originalname,
    );

    console.log("✅ Upload Success:", uploadResult);

    const responsePayload = {
      fileDetails: uploadResult,
      uploadedBy: isContestUpload ? "contest-user" : userId,
    };

    console.log("📦 Final Response Payload:", responsePayload);

    return successResponse(
      res,
      200,
      messageHelper.FILE_UPLOAD_SUCCESS,
      responsePayload,
    );
  } catch (error) {
    console.error("🔥 File upload FAILED:", error);
    return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
  }
});

// upload file to mentormahes enquiry
const uploadFileMentorMahesh = asyncHandler(async (req, res) => {
  console.log("📥 Incoming file upload request");
  console.log("➡️ Query params:", req.query);
  const userName = req.params.userName;

  const isContestUpload = req.query.contest === "true";
  console.log("📌 Is Contest Upload:", isContestUpload);

  if (!req.file) {
    console.log("❌ No file found in request");
    return errorResponse(res, 400, "No file uploaded");
  }

  console.log("📄 Received File:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });

  const MAX_FILE_SIZE = 200 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "video/mp4",
    "audio/mpeg",
  ];

  if (req.file.size > MAX_FILE_SIZE) {
    console.log("❌ File too large:", req.file.size);
    return errorResponse(
      res,
      400,
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    console.log("❌ Unsupported MIME Type:", req.file.mimetype);
    return errorResponse(res, 400, "Unsupported file type");
  }

  if (!isContestUpload) {
    console.log("🔐 Auth upload detected. Checking user...");

    if (!userName) {
      console.log("❌ Auth missing when required for regular upload");
      return errorResponse(res, 401, "Unauthorized upload");
    }

    console.log("👤 Upload by user:", userName);
  } else {
    console.log("🟦 Contest upload - no auth required");
  }

  const { buffer: fileBuffer, mimetype, originalname } = req.file;

  console.log("📤 Uploading file to storage...");
  console.log({
    bucket: "resumes",
    mimetype,
    originalname,
    fileSize: req.file.size,
  });

  try {
    const uploadResult = await uploadFileToMentorMahesh(
      fileBuffer,
      "resumes",
      mimetype,
      originalname,
    );

    console.log("✅ Upload Success:", uploadResult);

    const responsePayload = {
      fileDetails: uploadResult,
      uploadedBy: isContestUpload ? "contest-user" : userName,
    };

    console.log("📦 Final Response Payload:", responsePayload);

    return successResponse(
      res,
      200,
      messageHelper.FILE_UPLOAD_SUCCESS,
      responsePayload,
    );
  } catch (error) {
    console.error("🔥 File upload FAILED:", error);
    return res.status(500).json({ messge: "File upload faild", error });
  }
});

module.exports = { uploadFileController, uploadFileMentorMahesh };
