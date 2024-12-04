const asyncHandler = require("../utils/asyncHandler");
const { uploadFile } = require("../services/FileUpload");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");

const uploadFileController = asyncHandler(async (req, res, next) => {
  console.log("req.file", req.file);
  console.log("Authenticated user:", req.auth);

  if (!req.file) {
    return errorResponse(res, 400, "No file uploaded");
  }

  const userId = req.auth.userId;
  const { buffer: fileBuffer, mimetype, originalname } = req.file;

  try {
    const imageUrl = await uploadFile(fileBuffer, userId, mimetype, originalname);

    if (!imageUrl) {
      return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
    }

    return successResponse(res, 200, messageHelper.FILE_UPLOAD_SUCCESS, { imageUrl });
  } catch (error) {
    console.error("File upload error:", error);
    return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
  }
});

module.exports = {
  uploadFileController,
};
