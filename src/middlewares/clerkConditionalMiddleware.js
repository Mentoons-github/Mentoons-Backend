const { clerkMiddleware } = require("@clerk/express");

const conditionalClerkMiddleware = (req, res, next) => {
  if (req.path === "/api/v1/payment/ccavenue-response") {
    return next();
  }
  return clerkMiddleware()(req, res, next);
};

module.exports = conditionalClerkMiddleware;
