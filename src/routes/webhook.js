const express = require("express");
const { clerkWebhookConroller } = require("../controllers/clerk-webhook");
const router = express.Router();
const { ClerkExpressWithAuth } = require("@clerk/clerk-sdk-node");
const dotenv = require("dotenv");
dotenv.config();

router.post(
  "/clerk",
  ClerkExpressWithAuth(process.env.VITE_CLERK_WEBHOOK_SECRET),
  clerkWebhookConroller
);

module.exports = router;
