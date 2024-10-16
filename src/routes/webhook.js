const express = require("express");

const { clerkWebhookController } = require("../controllers/clerk-webhook");

const router = express.Router();

router.post("/clerk", clerkWebhookController);

module.exports = router;
