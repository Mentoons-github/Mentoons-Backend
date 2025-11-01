const Attendance = require("../../models/employee/attendance");
const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const Salary = require("../../models/employee/salary");
const asyncHandler = require("../../utils/asyncHandler");
const { isValidObjectId } = require("mongoose");
const ExcelJS = require("exceljs");

const getAttendanceData = asyncHandler(async (req, res) => {
  const { year, month, userId } = req.query;
  const { _id: currentUserId, role } = req.user;

  let targetUserId;
  let employee;

  if (role === "ADMIN") {
    if (!userId) {
      return res
        .status(400)
        .json({ message: "Admin must specify employeeId as userId" });
    }

    employee = await Employee.findById(userId).lean();
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee not found for given ID" });
    }

    targetUserId = employee.user;
  } else {
    employee = await Employee.findOne({ user: currentUserId }).lean();
    if (!employee) {
      return res
        .status(404)
        .json({ message: "Employee record not found for this user" });
    }

    targetUserId = currentUserId;
  }

  if (!year && !month) {
    return res
      .status(400)
      .json({ error: "Year or month query parameter is required" });
  }

  let responseData = {};
  const { _id: employeeId } = employee;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAttendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today, $lt: tomorrow },
  }).lean();

  responseData.todayAttendance = todayAttendance || null;

  if (year && !month) {
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const yearlyStats = await Attendance.aggregate([
      {
        $match: {
          employeeId: employee._id,
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
          onLeaveDays: {
            $sum: { $cond: [{ $eq: ["$status", "onLeave"] }, 1, 0] },
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ["$status", "halfDay"] }, 1, 0] },
          },
          lateDays: { $sum: { $cond: [{ $gt: ["$lateBy", 0] }, 1, 0] } },
          totalWorkHours: { $sum: "$workHours" },
        },
      },
      {
        $project: {
          totalDays: 1,
          presentDays: 1,
          absentDays: 1,
          onLeaveDays: 1,
          halfDays: 1,
          lateDays: 1,
          presentPercentage: {
            $cond: [
              { $gt: ["$totalDays", 0] },
              { $multiply: [{ $divide: ["$presentDays", "$totalDays"] }, 100] },
              0,
            ],
          },
          averageWorkHours: {
            $cond: [
              { $gt: ["$presentDays", 0] },
              { $divide: ["$totalWorkHours", "$presentDays"] },
              0,
            ],
          },
          _id: 0,
        },
      },
    ]);

    responseData.yearlyStats = yearlyStats[0] || {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      onLeaveDays: 0,
      halfDays: 0,
      lateDays: 0,
      presentPercentage: 0,
      averageWorkHours: 0,
    };

    const monthlyStats = await Attendance.aggregate([
      {
        $match: {
          employeeId: employee._id,
          date: { $gte: startOfYear, $lte: endOfYear },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          present: { $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] } },
          onLeave: { $sum: { $cond: [{ $eq: ["$status", "onLeave"] }, 1, 0] } },
          halfDay: { $sum: { $cond: [{ $eq: ["$status", "halfDay"] }, 1, 0] } },
          late: { $sum: { $cond: [{ $gt: ["$lateBy", 0] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: {
            $arrayElemAt: [
              [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ],
              { $subtract: ["$_id", 1] },
            ],
          },
          present: 1,
          absent: 1,
          onLeave: 1,
          halfDay: 1,
          late: 1,
          _id: 0,
        },
      },
    ]);

    responseData.monthlyStats = monthlyStats;
  }

  if (month && year) {
    const startOfMonth = new Date(`${year}-${month}-01`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    const monthlyDetails = await Attendance.find({
      employeeId: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .select(
        "date status lateBy workHours checkInTime checkOutTime earlyLeave"
      )
      .lean();

    responseData.monthlyDetails = monthlyDetails;
  }

  const targetUser = await User.findById(targetUserId).select("name").lean();

  responseData.employee = {
    userId: targetUserId,
    employeeId: employee ? employee._id : null,
    name: targetUser ? targetUser.name : null,
  };

  res.json(responseData);
});

const checkIn = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const employee = await Employee.findOne({ user: userId }).lean();
  if (!employee) {
    return res
      .status(400)
      .json({ message: "No employee record found for this user" });
  }

  const { _id: employeeId } = employee;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (existingAttendance && existingAttendance.checkInTime) {
    return res.status(400).json({ error: "Already checked in today" });
  }

  const now = new Date();
  const expectedCheckIn = new Date();
  expectedCheckIn.setHours(10, 0, 0, 0);
  const lateBy =
    now > expectedCheckIn ? Math.round((now - expectedCheckIn) / 60000) : 0;

  const attendance = new Attendance({
    employeeId,
    date: today,
    checkInTime: now,
    status: "present",
    lateBy,
  });

  await attendance.save();
  res.status(200).json({ message: "Checked in successfully" });
});

const checkOut = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const employee = await Employee.findOne({ user: userId }).lean();
  if (!employee) {
    return res
      .status(400)
      .json({ message: "No employee record found for this user" });
  }

  const { _id: employeeId } = employee;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const attendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (!attendance || !attendance.checkInTime) {
    return res
      .status(400)
      .json({ error: "No check-in record found for today" });
  }

  if (attendance.checkOutTime) {
    return res.status(400).json({ error: "Already checked out today" });
  }

  const now = new Date();
  const checkInTime = new Date(attendance.checkInTime);

  const expectedCheckOut = new Date();
  expectedCheckOut.setHours(18, 0, 0, 0);
  const earlyLeave =
    now < expectedCheckOut ? Math.round((expectedCheckOut - now) / 60000) : 0;

  const workHours = (now - checkInTime) / 3600000;

  attendance.checkOutTime = now;
  attendance.workHours = workHours;
  attendance.earlyLeave = earlyLeave;

  if (workHours < 2) {
    attendance.status = "leave";
  } else if (workHours < 4) {
    attendance.status = "halfDay";
  } else {
    attendance.status = "present";
  }

  await attendance.save();
  res.status(200).json({ message: "Checked out successfully" });
});

const getSalary = asyncHandler(async (req, res) => {
  console.log(
    "\n====================== getSalary API Called ======================"
  );
  console.log(req.query);

  const { role, _id: userId } = req.user;
  console.log("User Info =>", { role, userId });

  let employeeId;
  const currentDate = new Date();
  console.log("Current Date:", currentDate);

  // Utility function
  const getDaysBetween = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // -------------------- ADMIN CASE --------------------
  if (role === "ADMIN") {
    console.log("Role detected as ADMIN");
    employeeId = req.query.employeeId;

    if (!employeeId)
      return res.status(400).json({ message: "employeeId is required" });

    if (!isValidObjectId(employeeId))
      return res.status(400).json({ message: "Invalid employeeId" });

    // Check if employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    // Fetch salary records from Salary model
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const salaries = await Salary.find({ employeeId })
      .sort({ periodStart: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("Salaries found for ADMIN:", salaries.length);

    // Send salary data directly from DB
    return res.status(200).json({
      employeeId,
      employeeName: employee.name,
      monthlySalary: employee.salary || 0,
      annualSalary: (employee.salary || 0) * 12,
      totalSalaries: salaries.length,
      salaries,
    });
  }

  // -------------------- EMPLOYEE CASE --------------------
  else {
    console.log("Role detected as EMPLOYEE");

    const employee = await Employee.findOne({ user: userId });
    console.log(
      "Employee fetched by userId:",
      employee ? employee._id : "❌ Not found"
    );

    if (!employee) {
      return res
        .status(404)
        .json({ message: "No employee record found for this user" });
    }

    employeeId = employee._id;
    const joinDate = new Date(employee.joinDate);
    console.log("Employee join date:", joinDate);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log("Pagination:", { page, limit });

    const periodEnd = new Date(joinDate);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    console.log("Computed periodEnd:", periodEnd);

    if (periodEnd > currentDate) {
      console.log("Employee hasn't completed a full month yet.");
      return res.status(200).json({
        employeeId,
        monthlySalary: employee.salary || 0,
        annualSalary: (employee.salary || 0) * 12,
        salaries: [],
      });
    }

    const salaries = await Salary.find({
      employeeId,
      periodStart: { $gte: joinDate },
      periodEnd: { $lte: currentDate },
    })
      .sort({ periodStart: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log("Salaries found:", salaries.length);

    const adjustedSalaries = salaries.map((salary, index) => {
      const periodStart = new Date(
        Math.max(new Date(salary.periodStart), joinDate)
      );
      const periodEnd = new Date(salary.periodEnd);
      const totalDays = getDaysBetween(periodStart, periodEnd);

      return {
        ...salary._doc,
        totalDays,
      };
    });
    
    return res.status(200).json({
      employeeId,
      monthlySalary: employee.salary || 0,
      annualSalary: (employee.salary || 0) * 12,
      salaries: adjustedSalaries,
    });
  }
});

const exportSalary = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  let employeeId = req.query.employeeId;
  const currentDate = new Date();

  const getDaysBetween = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (role === "ADMIN") {
    if (!employeeId) {
      return res
        .status(400)
        .json({ message: "employeeId is required for admin" });
    }
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ message: "Invalid employeeId" });
    }
  } else {
    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      return res
        .status(404)
        .json({ message: "No employee record found for this user" });
    }
    employeeId = employee._id.toString();
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  let salaries;
  if (role === "ADMIN") {
    salaries = await Salary.find({
      employeeId,
      periodEnd: { $lte: currentDate },
    }).sort({ periodStart: -1 });

    salaries = salaries.flatMap((salary) => {
      const daysInPeriod = getDaysBetween(
        new Date(salary.periodStart),
        new Date(salary.periodEnd)
      );
      const dailySalaryAmount = salary.salaryAmount / daysInPeriod;
      const dailyPresentDays = salary.presentDays / daysInPeriod;
      const dailyTotalDays = 1;
      const dailyRecords = [];

      let currentDay = new Date(salary.periodStart);
      while (
        currentDay <= new Date(salary.periodEnd) &&
        currentDay <= currentDate
      ) {
        dailyRecords.push({
          _id: salary._id + "_" + currentDay.toISOString().split("T")[0],
          employeeId: salary.employeeId,
          periodStart: formatDate(currentDay),
          periodEnd: formatDate(currentDay),
          salaryAmount: dailySalaryAmount.toFixed(2),
          presentDays: dailyPresentDays > 0 ? 1 : 0,
          totalDays: dailyTotalDays,
          halfDays: (salary.halfDays / daysInPeriod).toFixed(1),
          leaveDays: (salary.leaveDays / daysInPeriod).toFixed(1),
          totalHoursWorked: (salary.totalHoursWorked / daysInPeriod).toFixed(1),
        });
        currentDay.setDate(currentDay.getDate() + 1);
      }
      return dailyRecords;
    });
  } else {
    const joinDate = new Date(employee.joinDate);
    const periodEnd = new Date(joinDate);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    salaries = await Salary.find({
      employeeId,
      periodStart: { $gte: joinDate },
      periodEnd: { $lte: currentDate },
    }).sort({ periodStart: -1 });

    salaries = salaries.map((salary) => {
      const periodStart = new Date(
        Math.max(new Date(salary.periodStart), joinDate)
      );
      const periodEnd = new Date(salary.periodEnd);
      const totalDays = getDaysBetween(periodStart, periodEnd);
      return {
        _id: salary._id,
        employeeId: salary.employeeId,
        periodStart: formatDate(salary.periodStart),
        periodEnd: formatDate(salary.periodEnd),
        salaryAmount: salary.salaryAmount.toFixed(2),
        presentDays: salary.presentDays,
        totalDays,
        halfDays: salary.halfDays.toFixed(1),
        leaveDays: salary.leaveDays.toFixed(1),
        totalHoursWorked: salary.totalHoursWorked.toFixed(1),
      };
    });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Salary History");

  worksheet.columns = [
    { header: "Employee ID", key: "employeeId", width: 15 },
    { header: "Monthly Salary (INR)", key: "monthlySalary", width: 20 },
    { header: "Annual Salary (INR)", key: "annualSalary", width: 20 },
    { header: "Period Start", key: "periodStart", width: 15 },
    { header: "Period End", key: "periodEnd", width: 15 },
    { header: "Payment Amount (INR)", key: "salaryAmount", width: 20 },
    { header: "Attendance", key: "attendance", width: 20 },
    { header: "Hours Worked", key: "totalHoursWorked", width: 15 },
  ];

  salaries.forEach((salary) => {
    worksheet.addRow({
      employeeId: employeeId,
      monthlySalary: (employee.salary || 0).toFixed(2),
      annualSalary: ((employee.salary || 0) * 12).toFixed(2),
      periodStart: salary.periodStart,
      periodEnd: salary.periodEnd,
      salaryAmount: salary.salaryAmount,
      attendance: `${salary.presentDays}/${salary.totalDays} (${(
        (salary.presentDays / salary.totalDays) *
        100
      ).toFixed(1)}%)`,
      totalHoursWorked: salary.totalHoursWorked,
    });
  });

  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "D3D3D3" },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=salary_history_${employeeId}.xlsx`
  );
  res.status(200).send(buffer);
});

module.exports = {
  getAttendanceData,
  checkIn,
  checkOut,
  getSalary,
  exportSalary,
};
