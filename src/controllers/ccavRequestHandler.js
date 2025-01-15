var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");

const dotenv = require("dotenv");
dotenv.config();

console.log(process.env.CCAVENUE_WORKING_KEY);
console.log(process.env.CCAVENUE_ACCESS_CODE);

exports.postReq = function (request, response) {
  var body = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`, //Put in the 32-Bit key shared by CCAvenues.
    accessCode = `${process.env.CCAVENUE_ACCESS_CODE}`, //Put in the Access Code shared by CCAvenues.
    encRequest = "",
    formbody = "";

  request.on("data", function (data) {
    console.log("Inside request data", data);
    body += data;

    console.log("Body", body);
    encRequest = ccav.encrypt(body, workingKey);
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
