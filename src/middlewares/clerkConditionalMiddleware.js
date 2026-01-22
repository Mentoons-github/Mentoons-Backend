const { clerkMiddleware } = require("@clerk/express");

const conditionalClerkMiddleware = (req, res, next) => {
  const skipPaths = [
    "/api/v1/payment/ccavenue-response",
    "/api/v1/webhook/clerk",
  ];

  if (skipPaths.includes(req.path)) {
    return next();
  }

  return clerkMiddleware()(req, res, next);
};

module.exports = conditionalClerkMiddleware;
