const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeProfile,
  editEmployee,
  requestProfileEdit,
} = require("../../controllers/employee/employee");
const {
  fetchTasks,
  assignTask,
  submitTask,
  deleteTask,
  updateTaskStatus,
  removeImage,
  extendTask,
} = require("../../controllers/employee/task");
const {
  verifyAdmin,
  verifyRole,
} = require("../../middlewares/admin/adminAuth");
const {
  getSalary,
  exportSalary,
} = require("../../controllers/employee/attendance");

const router = express.Router();

router.get("/salary", verifyRole(["EMPLOYEE", "ADMIN"]), getSalary);
router.get("/salary/export", verifyRole(["EMPLOYEE", "ADMIN"]), exportSalary);

router.get("/profile", verifyRole(["EMPLOYEE"]), getEmployeeProfile);
router.put("/edit", verifyRole(["EMPLOYEE"]), editEmployee);
router.post("/assign-task", verifyAdmin, assignTask);
router.get("/task-assignments", verifyRole(["ADMIN", "EMPLOYEE"]), fetchTasks);
router.post(
  "/task-assignments/:taskId/submit",
  verifyRole(["EMPLOYEE"]),
  submitTask
);
router.delete("/task-assignments/:taskId", verifyAdmin, deleteTask);
router.patch(
  "/task-assignments/:id/status",
  verifyRole(["ADMIN", "EMPLOYEE"]),
  updateTaskStatus
);
router.delete("/task-assignments/:taskId/image/:imageId", removeImage);
router.patch("/task-assignments/extend/:id", verifyAdmin, extendTask);

router.route("/").get(getEmployees).post(createEmployee);
router.get("/:id", getEmployeeById);
router.post("/request-edit", verifyRole(["EMPLOYEE"]), requestProfileEdit);

module.exports = router;
