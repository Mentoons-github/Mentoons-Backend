var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
dotenv.config();

exports.postReq = function (request, response) {
  var body = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`, // Put in the 32-Bit key shared by CCAvenues.
    accessCode = `${process.env.CCAVENUE_ACCESS_CODE}`, // Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  console.log("Working key length:", workingKey.length); // Log the length of the working key
  console.log("Working key:", workingKey); // Log the working key for debugging
  console.log("Access code:", accessCode);

  

  request.on("data", function (data) {
    console.log("DATA", data);
    body += data;
    encRequest = ccav.encrypt(body, workingKey);
    console.log(encRequest);
    formbody =
      '<form id="nonseamless" method="post" name="redirect" action="https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' +
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
  return;
};
