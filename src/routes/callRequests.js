const express = require("express");
const { getAllCallRequests, submitCallRequest, editCallRequestStatus, getCallRequestById, assignCallsToUser } = require("../controllers/workshopController");

const router = express.Router();
router.route("/").get(getAllCallRequests).post(submitCallRequest);
router.route("/:id").get(getCallRequestById).patch(editCallRequestStatus);
router.route("/assign/:userId").post(assignCallsToUser);


module.exports = router;