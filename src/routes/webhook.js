const express = require("express");
const { clerkWebhookConroller } = require("../controllers/clerk-webhook");
const router = express.Router();

router.post("/clerk",clerkWebhookConroller)

module.exports = router;