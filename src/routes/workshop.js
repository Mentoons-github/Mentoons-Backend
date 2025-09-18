const express = require("express");
const {
  submitWorkshopForm,
  getWorkshopEnquiries,
  getWorkshopEnquiriesById,
  submitCallRequest,
  getAllCallRequests,
  addWorkshop,
  getAllWorkshops,
  getWorkshopById,
  editWorkshop,
  deleteWorkshopImage,
} = require("../controllers/workshopController");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");

const router = express.Router();

router.get("/all", getAllWorkshops);
router.route("/submit-form").post(submitWorkshopForm);
router.route("/").get(getWorkshopEnquiries);
router.route("/:workshopId").get(getWorkshopEnquiriesById);
router.post(
  "/add-workshop",
  adminAuthMiddleware.adminAuthMiddleware,
  addWorkshop
);

router.get(
  "/workshop-data/:workshopId",
  adminAuthMiddleware.adminAuthMiddleware,
  getWorkshopById
);
router.put(
  "/edit/:workshopId",
  adminAuthMiddleware.adminAuthMiddleware,
  editWorkshop
);
router.delete(
  "/:workshopId/image/:ageRange",
  adminAuthMiddleware.adminAuthMiddleware,
  deleteWorkshopImage
);

// router.route("/submit-call-request").post(submitCallRequest);
// router.route("/call-requests").get(getAllCallRequests);

module.exports = router;
