const express = require("express");

const { addUserContributedPodcast } = require("../controllers/userContributedPodcastController");


const { authMiddleware} = require("../middlewares/authMiddleware");


const router = express.Router();

router.route("/").post(authMiddleware, addUserContributedPodcast);


module.exports = router;