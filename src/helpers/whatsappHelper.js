const twilio = require("twilio");

module.exports = {
  whatsappHelperFunc: async (number) => {
    const comicDetails = {
      thumbnail:
        "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/thumbnail/mini_images/1-13.jpg",
      pdf: "https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Book+2+-+Electronic+gadgets+and+kids.pdf",
    };
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      // Send the message with image
      const data = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER, // Your Twilio WhatsApp sandbox number
        to: `whatsapp:${number}`, // User's WhatsApp number
        body: `https://mentoons-comics.s3.ap-northeast-1.amazonaws.com/Comics-Pdf/Book+2+-+Electronic+gadgets+and+kids.pdf`,
        mediaUrl: [comicDetails.thumbnail], // Array of media URLs (image + PDF)
      });
      return true;
    } catch (error) {
      throw Error(error);
    }
  },
};
