const express = require("express");
const { getAllCallRequests, submitCallRequest, editCallRequestStatus, getCallRequestById, assignCallsToUser, reallocateCallFromUser } = require("../controllers/workshopController");
const { requireAuth } = require("@clerk/express");

const router = express.Router();
router.route("/").get(getAllCallRequests).post(submitCallRequest);
router.route("/:id").get(getCallRequestById).patch(editCallRequestStatus);
router.route("/assign/:userId").patch(requireAuth({ signInUrl: "/sign-in" }), assignCallsToUser);
router.route("/reallocate/:userId").patch(requireAuth({ signInUrl: "/sign-in" }), reallocateCallFromUser);

module.exports = router;