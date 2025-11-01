
const Employee = require("../../models/employee/employee");
const Attendance = require("../../models/employee/attendance");
const Salary = require("../../models/employee/salary");

const calculateSalary = async (employeeId, forDate = new Date()) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  const today = new Date(forDate);
  const exitDate = employee.exitDate || today;

  if (today > exitDate) return;

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: startOfDay, $lte: endOfDay },
  });

  let dailySalary = employee.salary / 30;
  let salaryAmount = 0;

  if (attendance) {
    if (attendance.status === "present") salaryAmount = dailySalary;
    else if (attendance.status === "halfDay") salaryAmount = dailySalary * 0.5;
    else if (attendance.status === "leave" || attendance.status === "onLeave")
      salaryAmount = 0;
  }

  const salaryRecord = await Salary.findOneAndUpdate(
    { employeeId, periodStart: startOfDay, periodEnd: endOfDay },
    {
      employeeId,
      periodStart: startOfDay,
      periodEnd: endOfDay,
      totalDays: 1,
      presentDays: attendance?.status === "present" ? 1 : 0,
      halfDays: attendance?.status === "halfDay" ? 1 : 0,
      leaveDays:
        attendance?.status === "leave" || attendance?.status === "onLeave"
          ? 1
          : 0,
      totalHoursWorked: attendance?.workHours || 0,
      salaryAmount,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return salaryRecord;
};

module.exports = calculateSalary;
