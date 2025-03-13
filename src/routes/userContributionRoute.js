const express = require("express");

const { addUserContributedPodcast } = require("../controllers/userContributedPodcastController");


const { authMiddleware} = require("../middlewares/authMiddleware");
const { requireAuth } = require("@clerk/express");


const router = express.Router();

router.route("/").post(requireAuth({ signInUrl: "/sign-in" }), addUserContributedPodcast);



module.exports = router;