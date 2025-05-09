const express = require("express");
const router = express.Router();
const influencerJobRequestController = require("../controllers/adda/influencerJobRequest");
const isAdmin = require("../middlewares/isAdmin");
const { conditionalAuth } = require("../middlewares/auth.middleware");
// Public route - Create new application
router.post("/", influencerJobRequestController.createInfluencerJobRequest);

// Admin protected routes
router.get(
  "/",
  conditionalAuth,
  isAdmin,
  influencerJobRequestController.getAllInfluencerJobRequests
);
router.get(
  "/:id",
  conditionalAuth,
  isAdmin,
  influencerJobRequestController.getInfluencerJobRequestById
);
router.patch(
  "/:id/status",
  conditionalAuth,
  isAdmin,
  influencerJobRequestController.updateInfluencerJobRequestStatus
);
router.delete(
  "/:id",
  conditionalAuth,
  isAdmin,
  influencerJobRequestController.deleteInfluencerJobRequest
);

module.exports = router;
