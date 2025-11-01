const Salary = require("../../models/employee/salary");
const Attendance = require("../../models/employee/attendance");
const Employee = require("../../models/employee/employee");
const moment = require("moment");

const recalculateMonthlySalary = async (employeeId) => {
  const now = new Date();
  const startOfMonth = moment(now).startOf("month").toDate();
  const endOfMonth = moment(now).endOf("month").toDate();

  const [employee, attendanceData] = await Promise.all([
    Employee.findById(employeeId),
    Attendance.find({
      employeeId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }),
  ]);

  if (!employee || !employee.salary) return;

  const totalDays = moment(now).daysInMonth();
  const presentDays = attendanceData.filter(
    (a) => a.status === "present"
  ).length;
  const leaveDays = attendanceData.filter((a) => a.status === "onLeave").length;
  const dailyRate = employee.salary / totalDays;
  const payableSalary = dailyRate * (presentDays + leaveDays);

  await Salary.findOneAndUpdate(
    { employeeId, periodStart: startOfMonth },
    {
      employeeId,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
      presentDays,
      leaveDays,
      totalDays,
      salaryAmount: payableSalary,
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

module.exports = recalculateMonthlySalary;
