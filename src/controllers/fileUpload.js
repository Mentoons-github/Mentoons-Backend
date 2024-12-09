const asyncHandler = require("../utils/asyncHandler");
const { uploadFile } = require("../services/FileUpload");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");

const uploadFileController = asyncHandler(async (req, res) => {
  // Validate file upload
  if (!req.file) {
    return errorResponse(res, 400, "No file uploaded");
  }

  // Additional file validation
  const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB
  const ALLOWED_MIME_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'application/pdf', 
    'video/mp4',
    'audio/mpeg',
    
  ];

  // Validate file size
  if (req.file.size > MAX_FILE_SIZE) {
    return errorResponse(res, 400, `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Validate file type
  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return errorResponse(res, 400, "Unsupported file type");
  }

  const userId = req.auth.userId;
  const { buffer: fileBuffer, mimetype, originalname } = req.file;

  try {
    const uploadResult = await uploadFile(fileBuffer, userId, mimetype, originalname);

    return successResponse(res, 200, messageHelper.FILE_UPLOAD_SUCCESS, { 
      fileDetails: uploadResult 
    });

  } catch (error) {
    console.error("File upload error:", error);
    return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
  }
});

module.exports = { uploadFileController };