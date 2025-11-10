const Employee = require("../../models/employee/employee");
const Attendance = require("../../models/employee/attendance");
const Salary = require("../../models/employee/salary");

const calculateSalary = async (employeeId, forDate = new Date()) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const date = new Date(forDate);
  const exitDate = employee.exitDate || date;
  if (date > exitDate) return null;

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  const dailySalary = employee.salary / 30;
  const status = attendance?.status || "absent";
  const workHours = attendance?.workHours || 0;

  const salaryAmount =
    status === "present"
      ? dailySalary
      : status === "halfDay"
      ? dailySalary * 0.5
      : 0;

  return await Salary.findOneAndUpdate(
    { employeeId, periodStart: startOfDay, periodEnd: endOfDay },
    {
      employeeId,
      periodStart: startOfDay,
      periodEnd: endOfDay,
      totalDays: 1,
      presentDays: status === "present" ? 1 : 0,
      halfDays: status === "halfDay" ? 1 : 0,
      leaveDays: status === "leave" || status === "onLeave" ? 1 : 0,
      totalHoursWorked: workHours,
      salaryAmount,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

module.exports = calculateSalary;
