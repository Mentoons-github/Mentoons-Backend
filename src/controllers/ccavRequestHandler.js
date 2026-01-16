var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
dotenv.config();

exports.postReq = function (request, response) {
  console.log("Inside post request");
  console.log("Request Body: ", request.body);

  var workingKey = `${process.env.CCAVENUE_WORKING_KEY}`, //Put in the 32-Bit key shared by CCAvenues.
    accessCode = `${process.env.CCAVENUE_ACCESS_CODE}`, //Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  // Use either the prepared params or request body
  const paramString = request.ccavenueParams || request.body;

  try {
    // If paramString is available, encrypt it directly
    if (paramString) {
      encRequest = ccav.encrypt(paramString, workingKey);

      formbody =
        '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
        encRequest +
        '"><input type="hidden" name="access_code" id="access_code" value="' +
        accessCode +
        '"><script language="javascript">document.redirect.submit();</script></form>';

      response.writeHeader(200, { "Content-Type": "text/html" });
      response.write(formbody);
      response.end();
      return;
    }

    // For backward compatibility, handle the request as before
    var body = "";
    request.on("data", function (data) {
      console.log("Data", data);
      body += data;
      encRequest = ccav.encrypt(body, workingKey);
      console.log("Encrypted Request", encRequest);
      formbody =
        '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
        encRequest +
        '"><input type="hidden" name="access_code" id="access_code" value="' +
        accessCode +
        '"><script language="javascript">document.redirect.submit();</script></form>';
    });

    request.on("end", function () {
      response.writeHeader(200, { "Content-Type": "text/html" });
      response.write(formbody);
      response.end();
    });
  } catch (error) {
    console.error("CCAvenue request error:", error);
    response.status(500).json({
      status: "error",
      message: "Failed to process payment request",
      error: error.message,
    });
  }
};
