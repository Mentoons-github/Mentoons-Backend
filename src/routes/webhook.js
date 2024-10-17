const express = require("express");
const {
  clerkWebhookController,
} = require("../controllers/clerkWebhookController");

const router = express.Router();

router.post("/clerk", clerkWebhookController);

module.exports = router;
