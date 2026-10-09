const express = require("express");
const {
  getUserSession,
  availabiltyCheck,
  getPsychologists,
  getAvailableSlots,
} = require("../controllers/session");
const { conditionalAuth } = require("../middlewares/auth.middleware");
const { verifyRole } = require("../middlewares/admin/adminAuth");

const sessionRoute = express.Router();

sessionRoute.use(conditionalAuth);

sessionRoute.get("/getbookings", getUserSession);
sessionRoute.get("/postpone", availabiltyCheck);

sessionRoute.get(
  "/psychologists",
  verifyRole(["USER", "ADMIN", "EMPLOYEE"]),
  getPsychologists,
);
sessionRoute.get(
  "/available-slots",
  verifyRole(["USER", "ADMIN", "EMPLOYEE"]),
  getAvailableSlots,
);

module.exports = sessionRoute;
