const multer = require("multer");
const path = require("path");

// Comprehensive file type validation
const FILE_TYPE_MAP = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  documents: [
    "application/pdf", 
    "application/msword", 
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/rtf"
  ],
  videos: ["video/mp4", "video/mpeg", "video/quicktime"],
  audio: [
    "audio/mpeg",   // MP3
    "audio/wav",    // WAV
    "audio/ogg",    // OGG
    "audio/webm",   // WebM Audio
    "audio/flac",   // FLAC
    "audio/x-m4a",  // M4A
    "audio/aac"     // AAC
  ]
};

// Flatten all allowed types
const ALLOWED_TYPES = Object.values(FILE_TYPE_MAP).flat();

const upload = multer({
  // Use memory storage for flexible handling
  storage: multer.memoryStorage(),
  
  // Limits configuration
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB max file size
    files: 1 // Limit to single file upload
  },
  
  // Enhanced file filter with detailed validation
  fileFilter: (req, file, cb) => {
    // Extract file extension and mime type
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    // Comprehensive file type validation
    if (ALLOWED_TYPES.includes(mimetype)) {
      cb(null, true);
    } else {
      // Create a more informative error
      const error = new Error('Invalid file type');
      error.details = {
        originalname: file.originalname,
        mimetype: mimetype,
        allowedTypes: ALLOWED_TYPES
      };
      cb(error, false);
    }
  }
});

module.exports = upload;