const {
  createEmployee,
  getEmployees,
} = require("../../controllers/employee/employee");
const { assignTask, fetchTasks } = require("../../controllers/employee/task");
const express = require("express");
const { verifyAdmin } = require("../../middlewares/admin/adminAuth");

const router = express.Router();

router.route("/").get(getEmployees).post(createEmployee);
router.post("/assign-task", verifyAdmin, assignTask);
router.get("/tasks", fetchTasks)

module.exports = router;
