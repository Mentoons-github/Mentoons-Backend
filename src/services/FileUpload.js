const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

// Initialize S3Client with credentials
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload file to S3 using AWS SDK v3
 * @param {Buffer} fileBuffer - File content as a buffer
 * @param {string} userId - ID of the user uploading the file
 * @param {string} mimetype - File MIME type
 * @param {string} originalname - Original file name
 * @returns {Object} - Upload result with file details
 */
async function uploadFile(fileBuffer, userId, mimetype, originalname) {
  try {
    // Generate unique filename
    const fileExtension = originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `uploads/${userId}/${Date.now()}-${uniqueFileName}`;

    // Prepare S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: "public-read",
      Metadata: {
        userId: userId,
        originalFileName: originalname,
        uploadTimestamp: Date.now().toString(),
      },
    };

    // Upload the file using AWS SDK v3
    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Generate public URL
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      url: fileUrl,
      key: key,
      originalName: originalname,
      mimetype: mimetype,
      uploadedAt: new Date().toISOString(),
      userId: userId,
      fileSize: fileBuffer.length,
    };
  } catch (error) {
    console.error("Detailed S3 Upload Error:", {
      message: error.message,
      code: error.name,
      userId: userId,
      originalName: originalname,
    });

    throw new Error(`S3 Upload Failed: ${error.message}`);
  }
}

module.exports = { uploadFile };




// const AWS = require("aws-sdk");
// const dotenv = require("dotenv");
// const { v4: uuidv4 } = require('uuid');

// dotenv.config();

// // Configure AWS S3 with advanced options
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
//   signatureVersion: 'v4',
//   httpOptions: {
//     timeout: 60000, // 60 seconds
//   }
// });

// /**
//  * Upload file to S3 with enhanced error handling and metadata
//  * @param {Buffer} fileBuffer - File content as a buffer
//  * @param {string} userId - ID of the user uploading the file
//  * @param {string} mimetype - File MIME type
//  * @param {string} originalname - Original file name
//  * @returns {Object} - Upload result with file details
//  */
// async function uploadFile(fileBuffer, userId, mimetype, originalname) {
//   // Generate unique filename
//   const fileExtension = originalname.split('.').pop();
//   const uniqueFileName = `${uuidv4()}.${fileExtension}`;
//   const key = `uploads/${userId}/${Date.now()}-${uniqueFileName}`;

//   // Prepare upload parameters with additional metadata
//   const params = {
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: key,
//     Body: fileBuffer,
//     ContentType: mimetype,
//     ACL: "public-read",
//     Metadata: {
//       userId: userId,
//       originalFileName: originalname,
//       uploadTimestamp: Date.now().toString()
//     }
//   };

//   try {
//     // Perform S3 upload with progress tracking
//     const upload = s3.upload(params);

//     // Optional: Track upload progress
//     upload.on('httpUploadProgress', (progress) => {
//       console.log(`Upload progress: ${(progress.loaded / progress.total) * 100}%`);
//     });

//     // Wait for upload to complete
//     const result = await upload.promise();

//     // Return comprehensive upload result
//     return {
//       url: result.Location,
//       key: result.Key,
//       originalName: originalname,
//       mimetype: mimetype,
//       uploadedAt: new Date().toISOString(),
//       userId: userId,
//       fileSize: fileBuffer.length
//     };
//   } catch (error) {
//     // Log detailed error information
//     console.error("Detailed S3 Upload Error:", {
//       message: error.message,
//       code: error.code,
//       userId: userId,
//       originalName: originalname
//     });

//     // Throw a more informative error
//     throw new Error(`S3 Upload Failed: ${error.message}`);
//   }
// }
