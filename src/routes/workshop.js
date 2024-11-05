const express = require("express");
const {
  submitWorkshopForm,
  getWorkshopEnquiries,
  getWorkshopEnquiriesById
} = require("../controllers/workshopController");

const router = express.Router();

router.route("/submit-form").post(submitWorkshopForm);
router.route("/").get(getWorkshopEnquiries);
router.route("/:workshopId").get(getWorkshopEnquiriesById);

module.exports = router;
