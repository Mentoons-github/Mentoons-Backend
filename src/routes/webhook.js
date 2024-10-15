const express = require("express");
const { clerkWebhookConroller } = require("../controllers/clerk-webhook");
const router = express.Router();
const { clerkMiddleware } = require("@clerk/express");

router.post(
  "/clerk",
  clerkMiddleware({ secretKey: process.env.VITE_CLERK_WEBHOOK_SECRET }),
  clerkWebhookConroller
);

module.exports = router;
