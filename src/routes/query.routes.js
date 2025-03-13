const express = require("express");
const queryController = require("../controllers/queryController");

const router = express.Router();

// GET all queries
router.get("/", queryController.getAllQueries);

// POST a new query
router.post("/", queryController.createQuery);

// PUT/update a query
router.put("/:id", queryController.updateQuery);

// DELETE a query
router.delete("/:id", queryController.deleteQuery);

module.exports = router;
