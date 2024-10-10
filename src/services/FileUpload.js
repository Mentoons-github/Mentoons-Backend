const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadFile(file,userId, mimetype, originalname) {
  const s3 = new AWS.S3();

  const fileBuffer = Buffer.from(file)
  const key = `${userId}/${Date.now()}-${originalname}`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
  };

  try {
    const result = await s3.upload(params).promise();
    console.log('File uploaded successfully:', result.Location);
    console.log(result)
    return result.Location;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

module.exports = {
    uploadFile
};



