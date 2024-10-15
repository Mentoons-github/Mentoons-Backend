const express = require("express");
const {
  submitWorkshopForm,
  getWorkshopFormData,
  getOneWorkshopData,
} = require("../controllers/workshopController");

const router = express.Router();

router.route("/submit-form").post(submitWorkshopForm);
router.route("/").get(getWorkshopFormData);
router.route("/:workshopId").get(getOneWorkshopData);

module.exports = router;
