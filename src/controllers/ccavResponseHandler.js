var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
dotenv.config();

exports.postRes = function (request, response) {
  var ccavEncResponse = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`;

  request.on("data", function (data) {
    ccavEncResponse += data;
  });

  request.on("end", function () {
    try {
      const ccavPOST = qs.parse(ccavEncResponse);
      const encryption = ccavPOST.encResp;
      const decryptedResponse = ccav.decrypt(encryption, workingKey);

      // Convert the response string to an object
      const responseObject = decryptedResponse.split("&").reduce((acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = value;
        return acc;
      }, {});

      response.setHeader("Content-Type", "application/json");
      response.status(200).json({
        status: "success",
        data: responseObject,
      });
    } catch (error) {
      response.setHeader("Content-Type", "application/json");
      response.status(500).json({
        status: "error",
        message: "Failed to process payment response",
        error: error.message,
      });
    }
  });
};
