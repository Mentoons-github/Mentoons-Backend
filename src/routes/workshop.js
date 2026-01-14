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
  deleteWorkshop,
  getAllWorkshopV2,
  addWorkshopV2,
} = require("../controllers/workshopController");
const adminAuthMiddleware = require("../middlewares/adminAuthMiddleware");
const verifyToken = require("../middlewares/addaMiddleware");
const { verifyAdmin } = require("../middlewares/admin/adminAuth");

const router = express.Router();

router.get("/all", getAllWorkshops);

//workshop version 2
router.get("/v2/workshopv2", getAllWorkshopV2);
router.post("/v2/add-workshopv2", addWorkshopV2);


//plans
router.get("/plans")


router.route("/submit-form").post(verifyToken, submitWorkshopForm);
router.route("/").get(verifyAdmin, getWorkshopEnquiries);
router.route("/:workshopId").get(verifyAdmin, getWorkshopEnquiriesById);
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

router.delete(
  "/:workshopId",
  adminAuthMiddleware.adminAuthMiddleware,
  deleteWorkshop
);

// router.route("/submit-call-request").post(submitCallRequest);
// router.route("/call-requests").get(getAllCallRequests);

//workshopV2

module.exports = router;
