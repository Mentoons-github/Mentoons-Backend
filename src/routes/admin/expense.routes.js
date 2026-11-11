const express = require("express");
const { verifyRole } = require("../../middlewares/admin/adminAuth");
const {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getPayees,
  updateExpense,
  deleteExpense,
} = require("../../controllers/admin/expense");

const router = express.Router();

router.get("/summary", verifyRole(["ADMIN"]), getExpenseSummary);
router.get("/payees", verifyRole(["ADMIN"]), getPayees);

router.get("/", verifyRole(["ADMIN"]), getExpenses);
router.post("/", verifyRole(["ADMIN"]), createExpense);
router.put("/:id", verifyRole(["ADMIN"]), updateExpense);
router.delete("/:id", verifyRole(["ADMIN"]), deleteExpense);

module.exports = router;
