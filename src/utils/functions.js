// const otpGenerator = require("otp-generator");
// const bcrypt = require("bcrypt");
// const { Twilio } = require("twilio");
// const twillio = require("twilio");
// const client = twillio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );
// module.exports = {
//   createOtp: async () => {
//     try {
//       const otp = otpGenerator.generate(6, {
//         upperCaseAlphabets: false,
//         lowerCaseAlphabets: false,
//         specialChars: false,
//       });
//       return otp;
//     } catch (error) {
//       throw new Error(error);
//     }
//   },
//   hashData: async (data) => {
//     console.log(data,'data')
//     try {
//       const hashedData = await bcrypt.hash(data, 10);
//       return hashedData;
//     } catch (error) {
//       throw new Error(error);
//     }
//   },
//   verifyData: async (data, hashedData) => {
//     try {
//       return await bcrypt.compare(data, hashedData);
//     } catch (error) {
//       console.log(error);
//       throw new Error(error);
//     }
//   },
//   phoneLookup: async (data) => {
//     try {
//       const phoneLookup = await client.lookups.v2
//         .phoneNumbers(data)
//         .fetch({ fields: "line_status" });
//       console.log(phoneLookup);
//     } catch (error) {
//       console.log(error);
//       throw new Error("Phone Number not valid");
//     }
//   },
// };
