const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

require("dotenv").config();

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const sendEmail = async (mailOptions) => {
  try {
    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM,

      Destination: {
        ToAddresses: Array.isArray(mailOptions.to)
          ? mailOptions.to
          : [mailOptions.to],
      },

      Message: {
        Subject: {
          Data: mailOptions.subject || "Message from Mentoons",
          Charset: "UTF-8",
        },

        Body: {
          Html: {
            Data: mailOptions.html || "",
            Charset: "UTF-8",
          },

          ...(mailOptions.text
            ? {
                Text: {
                  Data: mailOptions.text,
                  Charset: "UTF-8",
                },
              }
            : {}),
        },
      },
    });

    const response = await sesClient.send(command);

    console.log("✅ Email sent through Amazon SES:", response.MessageId);

    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error) {
    console.error("❌ Amazon SES error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = { sendEmail };
