const express = require("express");
const { getAllCallRequests, submitCallRequest, editCallRequestStatus, getCallRequestById } = require("../controllers/workshopController");

const router = express.Router();
router.route("/").get(getAllCallRequests).post(submitCallRequest);
router.route("/:id").get(getCallRequestById).patch(editCallRequestStatus);

module.exports = router;