var http = require("http"),
  fs = require("fs"),
  ccav = require("../utils/ccavutil.js"),
  qs = require("querystring");
const dotenv = require("dotenv");
dotenv.config();

exports.postRes = function (request, response) {
  var ccavEncResponse = "",
    ccavResponse = "",
    workingKey = `${process.env.CCAVENUE_WORKING_KEY}`, // Put in the 32-Bit key shared by CCAvenues.
    ccavPOST = "";

  // Check the length of the workingKey
  if (workingKey.length !== 32) {
    console.error("Invalid working key length. It must be 32 characters long.");
    response.writeHead(500, { "Content-Type": "text/plain" });
    response.write("Internal Server Error: Invalid working key length.");
    response.end();
    return;
  }

  request.on("data", function (data) {
    ccavEncResponse += data;
    ccavPOST = qs.parse(ccavEncResponse);
    var encryption = ccavPOST.encResp;
    ccavResponse = ccav.decrypt(encryption, workingKey);
  });

  request.on("end", function () {
    var pData = "";
    pData = "<table border=1 cellspacing=2 cellpadding=2><tr><td>";
    pData = pData + ccavResponse.replace(/=/gi, "</td><td>");
    pData = pData.replace(/&/gi, "</td></tr><tr><td>");
    pData = pData + "</td></tr></table>";
    htmlcode =
      '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><title>Response Handler</title></head><body><center><font size="4" color="blue"><b>Response Page</b></font><br>' +
      pData +
      "</center><br></body></html>";
    response.writeHeader(200, { "Content-Type": "text/html" });
    response.write(htmlcode);
    response.end();
  });
};
