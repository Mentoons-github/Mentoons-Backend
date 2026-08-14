const multer = require("multer");

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const createUpload = (options = {}) => {
  const {
    allowedMimeTypes = IMAGE_MIME_TYPES,
    maxFileSize = 50 * 1024 * 1024,
    maxFiles = 200,
  } = options;

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        const error = new Error("Invalid file type");
        error.details = {
          originalname: file.originalname,
          mimetype: file.mimetype,
          allowedTypes: allowedMimeTypes,
        };
        cb(error, false);
      }
    },
  });
};

const quizUpload = createUpload({
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFiles: 200,
}).any();

module.exports = { quizUpload, createUpload };
