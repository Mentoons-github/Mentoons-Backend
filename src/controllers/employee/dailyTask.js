const DailyReport = require("../../models/employee/dailyReport");
const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");
const { isValidObjectId } = require("mongoose");
const { sendEmail } = require("../../services/emailService");
const {
  getDailyReportEmailTemplate,
} = require("../../emailTemplates/dailyReportEmailTemplate");

const TIMEZONE = "Asia/Kolkata";

const OFF_DAYS = [0, 6];
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const SIGNATURE_REGEX = /^data:image\/(png|jpeg|jpg|webp);base64,/;
const MAX_SIGNATURE_LENGTH = 1_500_000;

const FRONTEND_URL = (
  process.env.FRONTEND_URL || "https://www.mentoons.com"
).replace(/\/$/, "");

const NOTIFY_ROLES = ["ADMIN", "SUPER-ADMIN"];

const ACTIVE_EMPLOYEE_FILTER = { active: true, inviteStatus: "accepted" };

const getTodayKey = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: TIMEZONE });

const isOffDay = (dateKey) =>
  OFF_DAYS.includes(new Date(`${dateKey}T00:00:00Z`).getUTCDay());

const formatDateLabel = (dateKey) => {
  const [y, m, d] = dateKey.split("-");
  return `${d}/${m}/${y}`;
};

const isValidSignature = (value) =>
  typeof value === "string" &&
  SIGNATURE_REGEX.test(value) &&
  value.length <= MAX_SIGNATURE_LENGTH;

const notifyAdminsOfReport = async ({ report, employee, userId, isUpdate }) => {
  const admins = await User.find({
    role: { $in: NOTIFY_ROLES },
    email: { $exists: true, $ne: "" },
  })
    .select("email")
    .lean();

  let recipients = admins.map((a) => a.email);
  if (recipients.length === 0 && process.env.SUPER_ADMIN_EMAIL) {
    recipients = [process.env.SUPER_ADMIN_EMAIL];
  }
  if (recipients.length === 0) {
    console.warn("Daily report email skipped: no admin email found");
    return;
  }

  const user = await User.findById(userId).select("name").lean();
  const employeeName = user?.name || "An employee";

  const reportUrl = `${FRONTEND_URL}/admin/reports-by-date?date=${report.date}&employee=${employee._id}`;
  const allReportsUrl = `${FRONTEND_URL}/admin/reports-by-date?date=${report.date}`;

  const { html, text } = getDailyReportEmailTemplate({
    employeeName,
    dateLabel: formatDateLabel(report.date),
    isLate: report.late,
    isUpdate,
    complete: report.complete,
    taskPreview: report.task,
    reportUrl,
    allReportsUrl,
  });

  await sendEmail({
    from: process.env.EMAIL_USER,
    to: recipients.join(","),
    subject: `Daily report ${isUpdate ? "updated" : "submitted"}: ${employeeName} (${formatDateLabel(report.date)})`,
    html,
    text,
  });
};

const submitReport = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  const employee = await Employee.findOne({ user: userId }).lean();
  if (!employee) {
    return res
      .status(404)
      .json({ error: "Employee record not found for this user" });
  }

  const { _id: employeeId } = employee;

  const { date, task, notes, tools, complete, reason, plan, didAsDiscussed } =
    req.body;

  if (!date || !DATE_REGEX.test(date)) {
    return res
      .status(400)
      .json({ error: "A valid date (YYYY-MM-DD) is required" });
  }

  const todayKey = getTodayKey();

  if (date > todayKey) {
    return res
      .status(400)
      .json({ error: "You cannot submit a report for a future date" });
  }

  if (isOffDay(date)) {
    return res.status(400).json({ error: "No report is needed on a day off" });
  }

  let report = await DailyReport.findOne({ employeeId, date });

  if (report && report.signature) {
    return res.status(403).json({
      error: "This report is already signed and can no longer be edited",
    });
  }

  if (report && date < todayKey) {
    return res.status(403).json({
      error: "A submitted report for a past day can no longer be edited",
    });
  }

  const isNew = !report;

  if (isNew) {
    report = new DailyReport({
      employeeId,
      date,
      late: date < todayKey,
    });
  }

  report.task = task;
  report.notes = notes || "";
  report.tools = tools || "";
  report.complete = complete;
  report.reason = complete === "NO" ? reason : "";
  report.plan = plan || "";
  report.didAsDiscussed = didAsDiscussed;
  report.submittedAt = new Date();

  try {
    await report.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(", ");
      return res.status(400).json({ error: message });
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "A report for this date already exists" });
    }
    throw error;
  }

  notifyAdminsOfReport({ report, employee, userId, isUpdate: !isNew }).catch(
    (err) => console.error("Daily report email failed:", err),
  );

  res.status(isNew ? 201 : 200).json({
    message: isNew
      ? "Report submitted successfully"
      : "Report updated successfully",
    report,
  });
});

const getMyReports = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { from, to } = req.query;

  if (!from || !to || !DATE_REGEX.test(from) || !DATE_REGEX.test(to)) {
    return res.status(400).json({
      error: "from and to (YYYY-MM-DD) query parameters are required",
    });
  }

  const employee = await Employee.findOne({ user: userId }).lean();
  if (!employee) {
    return res
      .status(404)
      .json({ error: "Employee record not found for this user" });
  }

  const user = await User.findById(userId).select("name").lean();

  const reports = await DailyReport.find({
    employeeId: employee._id,
    date: { $gte: from, $lte: to },
  })
    .sort({ date: 1 })
    .lean();

  res.status(200).json({
    employeeId: employee._id,
    employeeName: user?.name || null,
    reports,
  });
});

const getReportsByDate = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date || !DATE_REGEX.test(date)) {
    return res
      .status(400)
      .json({ error: "A valid date (YYYY-MM-DD) is required" });
  }

  if (date > getTodayKey()) {
    return res
      .status(400)
      .json({ error: "You cannot view reports for a future date" });
  }

  const [employees, reports] = await Promise.all([
    Employee.find(ACTIVE_EMPLOYEE_FILTER)
      .select("user jobRole department")
      .populate({ path: "user", select: "name" })
      .lean(),
    DailyReport.find({ date }).lean(),
  ]);

  const reportByEmployee = new Map(
    reports.map((r) => [String(r.employeeId), r]),
  );

  const rows = employees
    .map((emp) => {
      const report = reportByEmployee.get(String(emp._id)) || null;
      return {
        employeeId: emp._id,
        name: emp.user?.name || "Unknown",
        jobRole: emp.jobRole || "",
        department: emp.department || "",
        status: !report ? "missing" : report.signature ? "signed" : "submitted",
        report,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  res.status(200).json({
    date,
    isOffDay: isOffDay(date),
    employees: rows,
  });
});

const getAllReports = asyncHandler(async (req, res) => {
  const { from, to, employeeId, signed } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const filter = {};

  if (from || to) {
    if ((from && !DATE_REGEX.test(from)) || (to && !DATE_REGEX.test(to))) {
      return res.status(400).json({ error: "Dates must be YYYY-MM-DD" });
    }
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  if (employeeId) {
    if (!isValidObjectId(employeeId)) {
      return res.status(400).json({ error: "Invalid employeeId" });
    }
    filter.employeeId = employeeId;
  }

  if (signed === "true") filter.signature = { $ne: null };
  if (signed === "false") filter.signature = null;

  const [reports, totalCount] = await Promise.all([
    DailyReport.find(filter)
      .populate({
        path: "employeeId",
        select: "user",
        populate: { path: "user", select: "name" },
      })
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    DailyReport.countDocuments(filter),
  ]);

  const formatted = reports.map((r) => ({
    ...r,
    employeeName: r.employeeId?.user?.name || null,
    employeeId: r.employeeId?._id || null,
  }));

  res.status(200).json({
    totalReports: totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    reports: formatted,
  });
});

/* ---------- admin's saved signature (scanned once, reused) ---------- */

// GET /signature/me
const getMySignature = asyncHandler(async (req, res) => {
  const { _id: adminId } = req.user;

  const admin = await User.findById(adminId).select("+signatureImage").lean();

  res.status(200).json({ signature: admin?.signatureImage || null });
});

// PUT /signature/me   body: { signature: "data:image/png;base64,..." }
const saveMySignature = asyncHandler(async (req, res) => {
  const { _id: adminId } = req.user;
  const { signature } = req.body;

  if (!isValidSignature(signature)) {
    return res.status(400).json({
      error:
        "A valid signature image (PNG, JPG or WEBP, under 1 MB) is required",
    });
  }

  await User.findByIdAndUpdate(adminId, {
    $set: { signatureImage: signature },
  });

  res.status(200).json({ message: "Signature saved", signature });
});

// DELETE /signature/me
const deleteMySignature = asyncHandler(async (req, res) => {
  const { _id: adminId } = req.user;

  await User.findByIdAndUpdate(adminId, { $set: { signatureImage: null } });

  res.status(200).json({ message: "Saved signature removed" });
});

/* ---------- sign a report ---------- */
// body: { useSaved: true }  -> server uses the admin's saved signature
//   or  { signature: "data:image/..." } -> typed / drawn / one-off upload
const signReport = asyncHandler(async (req, res) => {
  const { _id: adminId } = req.user;

  const { id } = req.params;
  const { signature, useSaved } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  const admin = await User.findById(adminId)
    .select("name +signatureImage")
    .lean();

  let finalSignature;

  if (useSaved === true) {
    finalSignature = admin?.signatureImage;
    if (!finalSignature) {
      return res.status(400).json({
        error: "You have no saved signature. Please upload one first.",
      });
    }
  } else {
    if (!isValidSignature(signature)) {
      return res.status(400).json({
        error:
          "A valid signature image (PNG, JPG or WEBP, under 1 MB) is required",
      });
    }
    finalSignature = signature;
  }

  // Only signs if it is still unsigned, so two admins cannot sign at once
  const report = await DailyReport.findOneAndUpdate(
    { _id: id, signature: null },
    {
      $set: {
        signature: finalSignature,
        signedBy: String(adminId),
        signedByName: admin?.name || null,
        signedAt: new Date(),
      },
    },
    { new: true },
  );

  if (!report) {
    const exists = await DailyReport.exists({ _id: id });
    return exists
      ? res.status(409).json({ error: "This report is already signed" })
      : res.status(404).json({ error: "Report not found" });
  }

  res.status(200).json({
    message: "Report signed successfully",
    report,
  });
});

module.exports = {
  submitReport,
  getMyReports,
  getAllReports,
  signReport,
  getReportsByDate,
  getMySignature,
  saveMySignature,
  deleteMySignature,
};
