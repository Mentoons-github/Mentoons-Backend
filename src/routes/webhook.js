const express = require("express");
const { clerkWebhookConroller } = require("../controllers/clerk-webhook");
const router = express.Router();
const { requireAuth } = require("@clerk/express");
const dotenv = require("dotenv");
dotenv.config();
router.post(
  "/clerk",
  requireAuth({ secretKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }),
  clerkWebhookConroller
);

module.exports = router;
