const express = require("express");
const {
  getEmployeeData,
  getById,
  deleteEmployee,
  createEmployee,
  editEmployee,
} = require("../controllers/employee");

const employeeRouter = express.Router();

employeeRouter.route("/").get(getEmployeeData).post(createEmployee);
employeeRouter
  .route("/:id")
  .get(getById)
  .delete(deleteEmployee)
  .put(editEmployee);

module.exports = employeeRouter;
