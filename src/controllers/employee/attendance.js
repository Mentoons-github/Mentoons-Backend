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

  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - offset);

  const localToday = new Date(localNow);
  localToday.setHours(0, 0, 0, 0);

  const localTomorrow = new Date(localToday);
  localTomorrow.setDate(localToday.getDate() + 1);

  const today = new Date(localToday.getTime() + offset);
  const tomorrow = new Date(localTomorrow.getTime() + offset);

  const todayAttendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today, $lt: tomorrow },
  }).lean();

  responseData.todayAttendance = todayAttendance || null;

  if (year && !month) {
    const startOfYearLocal = new Date(`${year}-01-01T00:00:00`);
    const endOfYearLocal = new Date(`${year}-12-31T23:59:59`);

    const startOfYear = new Date(startOfYearLocal.getTime() + offset);
    const endOfYear = new Date(endOfYearLocal.getTime() + offset);

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
    const startOfMonthLocal = new Date(`${year}-${month}-01T00:00:00`);
    const endOfMonthLocal = new Date(startOfMonthLocal);
    endOfMonthLocal.setMonth(endOfMonthLocal.getMonth() + 1);
    endOfMonthLocal.setDate(0);

    const startOfMonth = new Date(startOfMonthLocal.getTime() + offset);
    const endOfMonth = new Date(endOfMonthLocal.getTime() + offset);

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

  const now = new Date();
  const localOffset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - localOffset);

  const localToday = new Date(localNow);
  localToday.setHours(0, 0, 0, 0);

  const localTomorrow = new Date(localToday);
  localTomorrow.setDate(localToday.getDate() + 1);

  const today = new Date(localToday.getTime() + localOffset);
  const tomorrow = new Date(localTomorrow.getTime() + localOffset);

  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: { $gte: today, $lt: tomorrow },
  });

  if (existingAttendance && existingAttendance.checkInTime) {
    return res.status(400).json({ error: "Already checked in today" });
  }

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

  const now = new Date();
  const localOffset = now.getTimezoneOffset() * 60000;
  const localNow = new Date(now.getTime() - localOffset);

  const localToday = new Date(localNow);
  localToday.setHours(0, 0, 0, 0);

  const localTomorrow = new Date(localToday);
  localTomorrow.setDate(localToday.getDate() + 1);

  const today = new Date(localToday.getTime() + localOffset);
  const tomorrow = new Date(localTomorrow.getTime() + localOffset);

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

  const nowUTC = new Date();
  const currentDate = new Date(
    Date.UTC(nowUTC.getUTCFullYear(), nowUTC.getUTCMonth(), nowUTC.getUTCDate())
  );
  console.log("Current UTC Date:", currentDate);

  const getDaysBetween = (startDate, endDate) => {
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (role === "ADMIN") {
    console.log("Role detected as ADMIN");

    employeeId = req.query.employeeId;

    if (!employeeId)
      return res.status(400).json({ message: "employeeId is required" });

    if (!isValidObjectId(employeeId))
      return res.status(400).json({ message: "Invalid employeeId" });

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const [salaries, totalCount] = await Promise.all([
      Salary.find({ employeeId })
        .sort({ periodStart: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Salary.countDocuments({ employeeId }),
    ]);

    console.log("Salaries found for ADMIN:", salaries.length);

    return res.status(200).json({
      role,
      employeeId,
      employeeName: employee.name,
      monthlySalary: employee.salary || 0,
      annualSalary: (employee.salary || 0) * 12,
      totalSalaries: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      salaries,
    });
  } else {
    console.log("Role detected as EMPLOYEE");

    const employee = await Employee.findOne({ user: userId });
    if (!employee) {
      console.log("❌ No employee record found for this user");
      return res
        .status(404)
        .json({ message: "No employee record found for this user" });
    }

    employeeId = employee._id;
    const joinDate = new Date(employee.joinDate);
    console.log("Employee join date:", joinDate);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const firstPeriodEnd = new Date(joinDate);
    firstPeriodEnd.setMonth(firstPeriodEnd.getMonth() + 1);

    if (firstPeriodEnd > currentDate) {
      console.log("Employee hasn't completed a full month yet.");
      return res.status(200).json({
        role,
        employeeId,
        employeeName: employee.name,
        monthlySalary: employee.salary || 0,
        annualSalary: (employee.salary || 0) * 12,
        salaries: [],
      });
    }

    const [salaries, totalCount] = await Promise.all([
      Salary.find({
        employeeId,
        periodStart: { $gte: joinDate },
        periodEnd: { $lte: currentDate },
      })
        .sort({ periodStart: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Salary.countDocuments({
        employeeId,
        periodStart: { $gte: joinDate },
        periodEnd: { $lte: currentDate },
      }),
    ]);

    console.log("Salaries found:", salaries.length);

    const adjustedSalaries = salaries.map((salary) => {
      const periodStart = new Date(
        Math.max(new Date(salary.periodStart), joinDate)
      );
      const periodEnd = new Date(salary.periodEnd);
      const totalDays = getDaysBetween(periodStart, periodEnd);

      return { ...salary._doc, totalDays };
    });

    return res.status(200).json({
      role,
      employeeId,
      employeeName: employee.name,
      monthlySalary: employee.salary || 0,
      annualSalary: (employee.salary || 0) * 12,
      totalSalaries: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
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

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (role === "ADMIN") {
    if (!employeeId)
      return res
        .status(400)
        .json({ message: "employeeId is required for admin" });

    if (!isValidObjectId(employeeId))
      return res.status(400).json({ message: "Invalid employeeId" });
  } else {
    const employee = await Employee.findOne({ user: userId });
    if (!employee)
      return res
        .status(404)
        .json({ message: "No employee record found for this user" });

    employeeId = employee._id.toString();
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ message: "Employee not found" });

  let salaries = [];

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

      const dailySalary = (salary.salaryAmount || 0) / daysInPeriod;
      const dailyRecords = [];

      let currentDay = new Date(salary.periodStart);

      while (currentDay <= new Date(salary.periodEnd)) {
        dailyRecords.push({
          id: `${salary._id}_${currentDay.toISOString().split("T")[0]}`,
          employeeId: salary.employeeId,
          periodStart: formatDate(currentDay),
          periodEnd: formatDate(currentDay),
          salaryAmount: dailySalary.toFixed(2),
          presentDays: 1,
          totalDays: 1,
          halfDays: (salary.halfDays || 0 / daysInPeriod).toFixed(1),
          leaveDays: (salary.leaveDays || 0 / daysInPeriod).toFixed(1),
          totalHoursWorked: (
            (salary.totalHoursWorked || 0) / daysInPeriod
          ).toFixed(1),
        });

        currentDay.setDate(currentDay.getDate() + 1);
      }

      return dailyRecords;
    });
  } else {
    const joinDate = new Date(employee.joinDate);
    const salariesList = await Salary.find({
      employeeId,
      periodStart: { $gte: joinDate },
      periodEnd: { $lte: currentDate },
    }).sort({ periodStart: -1 });

    salaries = salariesList.map((salary) => {
      const periodStart = new Date(
        Math.max(new Date(salary.periodStart), joinDate)
      );
      const periodEnd = new Date(salary.periodEnd);
      const totalDays = getDaysBetween(periodStart, periodEnd);

      return {
        id: salary._id.toString(),
        employeeId: salary.employeeId,
        periodStart: formatDate(salary.periodStart),
        periodEnd: formatDate(salary.periodEnd),
        salaryAmount: (salary.salaryAmount || 0).toFixed(2),
        presentDays: salary.presentDays || 0,
        totalDays,
        halfDays: (salary.halfDays || 0).toFixed(1),
        leaveDays: (salary.leaveDays || 0).toFixed(1),
        totalHoursWorked: (salary.totalHoursWorked || 0).toFixed(1),
      };
    });
  }

  try {
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
        employeeId,
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
  } catch (error) {
    console.error("❌ Excel generation failed:", error);
    res.status(500).json({ message: "Failed to generate salary export" });
  }
});

module.exports = {
  getAttendanceData,
  checkIn,
  checkOut,
  getSalary,
  exportSalary,
};
