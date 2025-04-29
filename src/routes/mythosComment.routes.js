const express = require("express");
const router = express.Router();
const {
  createMythosComment,
  getAllMythosComments,
  getMythosCommentById,
  updateMythosComment,
  deleteMythosComment,
} = require("../controllers/mythosCommentController");

router.post("/", createMythosComment);
router.get("/", getAllMythosComments);
router.get("/:id", getMythosCommentById);
router.put("/:id", updateMythosComment);
router.delete("/:id", deleteMythosComment);

module.exports = router;
