const asyncHandler = require("../utils/asyncHandler");
const { uploadFile } = require("../services/FileUpload");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");

const uploadFileController = asyncHandler(async (req, res) => {
  console.log("Incoming file upload request");

  if (!req.file) {
    console.log("No file found in request");
    return errorResponse(res, 400, "No file uploaded");
  }

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
    console.log("File too large:", req.file.size);
    return errorResponse(
      res,
      400,
      `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    console.log("Unsupported file type:", req.file.mimetype);
    return errorResponse(res, 400, "Unsupported file type");
  }

  const userId = req.auth.userId;
  const { buffer: fileBuffer, mimetype, originalname } = req.file;

  console.log("Preparing to upload file:");
  console.log("User ID:", userId);
  console.log("File name:", originalname);
  console.log("MIME type:", mimetype);
  console.log("File size:", req.file.size);

  try {
    const uploadResult = await uploadFile(
      fileBuffer,
      userId,
      mimetype,
      originalname
    );

    console.log("Upload result:", uploadResult);

    return successResponse(res, 200, messageHelper.FILE_UPLOAD_SUCCESS, {
      fileDetails: uploadResult,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
  }
});

module.exports = { uploadFileController };
