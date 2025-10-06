const express = require("express");
const adminAuthMiddleware = require("../../middlewares/adminAuthMiddleware");
const {
  addMeetup,
  allMeetups,
  fetchMeetupById,
  editMeetup,
  deleteMeetupImage,
} = require("../../controllers/meetup");

const router = express.Router();

router.get("/", allMeetups);
router.get("/:id", fetchMeetupById);

router.use(adminAuthMiddleware.adminAuthMiddleware);
router.post("/add", addMeetup);
router.patch("/edit/:id", editMeetup);
router.delete("/:id/image", deleteMeetupImage);

module.exports = router;
