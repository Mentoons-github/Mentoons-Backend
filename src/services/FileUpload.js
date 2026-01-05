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

async function uploadFileToMentorMahesh(
  fileBuffer,
  userId,
  mimetype,
  originalname
) {
  try {
    // Generate unique filename
    const fileExtension = originalname.split(".").pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const key = `uploads/${userId}/${Date.now()}-${uniqueFileName}`;

    // Prepare S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME_MENTORMAHESH,
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
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME_MENTORMAHESH}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

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

module.exports = { uploadFile, uploadFileToMentorMahesh };
