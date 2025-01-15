const ccavenueConfig = {
  merchant_id: process.env.CCAVENUE_MERCHANT_ID,
  working_key: process.env.CCAVENUE_WORKING_KEY,
  access_code: process.env.CCAVENUE_ACCESS_CODE,
  redirect_url: process.env.CCAVENUE_REDIRECT_URL,
  cancel_url: process.env.CCAVENUE_CANCEL_URL,
  // gateway_url: 'https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction'
  gateway_url:
    "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction",
};

module.exports = ccavenueConfig;
