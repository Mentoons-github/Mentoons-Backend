const express = require("express");
const {
  comicWhatsappController,
} = require("../controllers/whatsappController");
const router = express.Router();

router.post("/sendComic", comicWhatsappController);

module.exports = router;
