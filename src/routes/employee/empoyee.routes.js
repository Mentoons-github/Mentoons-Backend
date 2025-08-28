const {
  createEmployee,
  getEmployees,
} = require("../../controllers/employee/employee");
const { assignTask } = require("../../controllers/employee/task");
const verifyToken = require("../../middlewares/addaMiddleware");

const express = require("express");

const router = express.Router();

router.route("/").get(getEmployees).post(createEmployee);
router.post("/assign-task", verifyToken, assignTask);

module.exports = router;
