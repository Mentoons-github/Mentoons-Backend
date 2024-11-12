const express = require("express")
const router = express.Router()
const { addAuthor, getAllAuthors } = require("../controllers/author")

router.route("/").post(addAuthor).get(getAllAuthors)

module.exports = router 