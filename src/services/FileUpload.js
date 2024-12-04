const AWS = require("aws-sdk");
const dotenv = require("dotenv");

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Upload file to S3
 * @param {Buffer} fileBuffer - File content as a buffer
 * @param {string} userId - ID of the user uploading the file
 * @param {string} mimetype - File MIME type
 * @param {string} originalname - Original file name
 * @returns {string} - Public URL of the uploaded file
 */
async function uploadFile(fileBuffer, userId, mimetype, originalname) {
  const key = `${userId}/${Date.now()}-${originalname}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: "public-read",
  };

  try {
    const result = await s3.upload(params).promise();
    console.log("File uploaded successfully:", result.Location);
    return result.Location;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file to S3");
  }
}

module.exports = {
  uploadFile,
};
