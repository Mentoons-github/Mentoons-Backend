const express = require("express");
const {
  submitWorkshopForm,
  getWorkshopFormData,
} = require("../controllers/workshopController");

const router = express.Router();

router.route("/submit-form").post(submitWorkshopForm);
router.route("/").get(getWorkshopFormData);

module.exports = router;
