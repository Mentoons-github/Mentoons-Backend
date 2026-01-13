const express = require("express");
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeProfile,
  editEmployee,
  requestProfileEdit,
  getEmployeesCelebrations,
  getMe,
  employeeLogin,
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

//Salary
router.get("/salary", verifyRole(["EMPLOYEE", "ADMIN"]), getSalary);
router.get("/salary/export", verifyRole(["EMPLOYEE", "ADMIN"]), exportSalary);
router.get("/me", verifyRole(["EMPLOYEE"]), getMe);

//Birthday
router.get(
  "/birthday",
  verifyRole(["ADMIN", "EMPLOYEE"]),
  getEmployeesCelebrations
);

//Profile
router.get("/profile", verifyRole(["EMPLOYEE"]), getEmployeeProfile);
router.put("/edit", verifyRole(["EMPLOYEE"]), editEmployee);
router.post("/request-edit", verifyRole(["EMPLOYEE"]), requestProfileEdit);

//Task Assign
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

//Base
router.route("/").get(getEmployees).post(createEmployee);
router.get("/:id", getEmployeeById);
router.post("/login/:employeeId", employeeLogin);

module.exports = router;
