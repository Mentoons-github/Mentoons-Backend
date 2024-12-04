const express = require("express");
const router = express.Router();
const { uploadFile } = require("../services/FileUpload");
const asyncHandler = require("../utils/asyncHandler");
const { errorResponse, successResponse } = require("../utils/responseHelper");
const messageHelper = require("../utils/messageHelper");
const fs = require("fs").promises;

const uploadFileController = asyncHandler(async (req, res, next) => {
  console.log("req.file", req.file);
  if (!req.file) {
    return errorResponse(res, 400, "No file uploaded");
  }
  const userId = req.auth.userId;
  const { path, mimetype, originalname } = req.file;

  try {
    const fileBuffer = await fs.readFile(path);
    const imageUrl = await uploadFile(
      fileBuffer,
      userId,
      mimetype,
      originalname
    );
    await fs.unlink(path);

    if (!imageUrl) {
      return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
    }
    return successResponse(res, 200, messageHelper.FILE_UPLOAD_SUCCESS, {
      imageUrl,
    });
  } catch (error) {
    console.error("File upload error:", error);
    return errorResponse(res, 500, messageHelper.FILE_UPLOAD_FAILED);
  }
});

module.exports = {
  uploadFileController,
};
