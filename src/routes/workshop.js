const express = require("express");
const {
  submitWorkshopForm,
  getWorkshopEnquiries,
  getWorkshopEnquiriesById,
  submitCallRequest
} = require("../controllers/workshopController");

const router = express.Router();

router.route("/submit-form").post(submitWorkshopForm);
router.route("/").get(getWorkshopEnquiries);
router.route("/:workshopId").get(getWorkshopEnquiriesById);
router.route("/submit-call-request").post(submitCallRequest);

module.exports = router;
