const mongoose = require("mongoose");
const Expense = require("../../models/admin/expense");
const Employee = require("../../models/employee/employee");
const asyncHandler = require("../../utils/asyncHandler");

const { isValidObjectId } = mongoose;
const { CATEGORIES, EXPENSE_TYPES, PAYMENT_MODES, PAYMENT_STATUSES } = Expense;

const EMPLOYEE_CATEGORIES = ["salary", "freelancer", "incentive"];

const FREELANCE_QUERY = {
  $or: [{ department: "freelance" }, { employmentType: "freelance" }],
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const employeePopulate = {
  path: "employee",
  select: "department jobRole salary employmentType user",
  populate: { path: "user", select: "name email" },
};

/* ------------------------------ helpers ------------------------------ */

const buildFilter = (q) => {
  const filter = {};

  if (q.category && CATEGORIES.includes(q.category)) {
    filter.category = q.category;
  }
  if (q.expenseType && EXPENSE_TYPES.includes(q.expenseType)) {
    filter.expenseType = q.expenseType;
  }
  if (q.paymentMode && PAYMENT_MODES.includes(q.paymentMode)) {
    filter.paymentMode = q.paymentMode;
  }
  if (q.status && PAYMENT_STATUSES.includes(q.status)) {
    filter.status = q.status;
  }
  if (q.employeeId && isValidObjectId(q.employeeId)) {
    filter.employee = new mongoose.Types.ObjectId(q.employeeId);
  }

  if (q.from || q.to) {
    filter.date = {};
    if (q.from) filter.date.$gte = new Date(`${q.from}T00:00:00.000Z`);
    if (q.to) filter.date.$lte = new Date(`${q.to}T23:59:59.999Z`);
  }

  if (q.search && String(q.search).trim()) {
    const rx = new RegExp(escapeRegex(String(q.search).trim()), "i");
    filter.$or = [
      { title: rx },
      { vendorName: rx },
      { transactionRef: rx },
      { billNumber: rx },
    ];
  }

  return filter;
};

// Validates the body and turns it into a clean document.
// Returns { error: { status, message } } or { data }.
const prepareExpense = async (body, existingId = null) => {
  const category = body.category;
  const expenseType = body.expenseType;
  const paymentMode = body.paymentMode;

  if (!CATEGORIES.includes(category)) {
    return { error: { status: 400, message: "Invalid category" } };
  }
  if (!EXPENSE_TYPES.includes(expenseType)) {
    return {
      error: { status: 400, message: "Type must be internal or external" },
    };
  }
  if (!PAYMENT_MODES.includes(paymentMode)) {
    return { error: { status: 400, message: "Invalid mode of payment" } };
  }
  if (body.status && !PAYMENT_STATUSES.includes(body.status)) {
    return { error: { status: 400, message: "Invalid payment status" } };
  }

  const data = {
    category,
    expenseType,
    paymentMode,
    description: body.description ? String(body.description).trim() : "",
    transactionRef: body.transactionRef
      ? String(body.transactionRef).trim()
      : "",
    status: body.status || "paid",
    vendorName: body.vendorName ? String(body.vendorName).trim() : "",
    billNumber: body.billNumber ? String(body.billNumber).trim() : "",
    date: body.date ? new Date(body.date) : new Date(),
    amount: Number(body.amount),
    title: body.title ? String(body.title).trim() : "",
  };

  if (Number.isNaN(data.date.getTime())) {
    return { error: { status: 400, message: "Invalid date" } };
  }

  let employee = null;

  if (EMPLOYEE_CATEGORIES.includes(category)) {
    if (!body.employee || !isValidObjectId(body.employee)) {
      return {
        error: { status: 400, message: "Please select a valid employee" },
      };
    }

    employee = await Employee.findById(body.employee)
      .populate("user", "name")
      .lean();

    if (!employee) {
      return { error: { status: 404, message: "Employee not found" } };
    }

    const isFreelancer =
      employee.department === "freelance" ||
      employee.employmentType === "freelance";

    if (category === "freelancer" && !isFreelancer) {
      return {
        error: {
          status: 400,
          message: "Selected person is not a freelancer",
        },
      };
    }
    if (category === "salary" && isFreelancer) {
      return {
        error: {
          status: 400,
          message: "Freelancers are paid under the Freelancer category",
        },
      };
    }

    data.employee = employee._id;
  }

  if (category === "salary") {
    const month = Number(body.salaryMonth);
    const year = Number(body.salaryYear);

    if (!month || month < 1 || month > 12 || !year) {
      return {
        error: { status: 400, message: "Salary month and year are required" },
      };
    }

    data.salaryMonth = month;
    data.salaryYear = year;

    // fall back to the salary saved on the employee record
    if (!data.amount && employee.salary) data.amount = employee.salary;

    const duplicate = await Expense.findOne({
      category: "salary",
      employee: employee._id,
      salaryMonth: month,
      salaryYear: year,
      ...(existingId ? { _id: { $ne: existingId } } : {}),
    }).lean();

    if (duplicate) {
      return {
        error: {
          status: 409,
          message: "Salary for this employee and month is already recorded",
        },
      };
    }
  }

  if (!data.amount || Number.isNaN(data.amount) || data.amount <= 0) {
    return {
      error: { status: 400, message: "Amount must be greater than 0" },
    };
  }

  if (!data.title) {
    if (employee) {
      const name = employee.user?.name || "Employee";
      const label =
        category === "salary"
          ? `Salary - ${name} (${data.salaryMonth}/${data.salaryYear})`
          : category === "freelancer"
            ? `Freelancer payment - ${name}`
            : `Incentive - ${name}`;
      data.title = label;
    } else {
      return { error: { status: 400, message: "Title is required" } };
    }
  }

  return { data };
};

/* ------------------------------ handlers ------------------------------ */

const createExpense = asyncHandler(async (req, res) => {
  const { error, data } = await prepareExpense(req.body);
  if (error) return res.status(error.status).json({ error: error.message });

  const expense = await Expense.create({ ...data, createdBy: req.user._id });
  const populated = await Expense.findById(expense._id)
    .populate(employeePopulate)
    .lean();

  res
    .status(201)
    .json({ message: "Expense added successfully", expense: populated });
});

const getExpenses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
  const filter = buildFilter(req.query);

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate(employeePopulate)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Expense.countDocuments(filter),
  ]);

  res.json({
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit) || 1,
    expenses,
  });
});

const getExpenseSummary = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.query);

  const group = (field) => [
    {
      $group: {
        _id: field,
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ];

  const [result] = await Expense.aggregate([
    { $match: filter },
    {
      $facet: {
        overall: [
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ],
        byCategory: group("$category"),
        byType: group("$expenseType"),
        byMode: group("$paymentMode"),
        byStatus: group("$status"),
      },
    },
  ]);

  const overall = result.overall[0] || { total: 0, count: 0 };

  res.json({
    grandTotal: overall.total,
    count: overall.count,
    byCategory: result.byCategory,
    byType: result.byType,
    byMode: result.byMode,
    byStatus: result.byStatus,
  });
});

// Dropdown data for the form: group = staff | freelancer | all
const getPayees = asyncHandler(async (req, res) => {
  const { group = "all" } = req.query;

  let filter = {};
  if (group === "freelancer") filter = FREELANCE_QUERY;
  if (group === "staff") filter = { $nor: FREELANCE_QUERY.$or };

  const employees = await Employee.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    employees: employees.map((e) => ({
      _id: e._id,
      name: e.user?.name || "Unnamed",
      email: e.user?.email || "",
      department: e.department,
      jobRole: e.jobRole,
      employmentType: e.employmentType,
      salary: e.salary || 0,
      active: e.active,
    })),
  });
});

const updateExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid expense id" });
  }

  const existing = await Expense.findById(id);
  if (!existing) return res.status(404).json({ error: "Expense not found" });

  const { error, data } = await prepareExpense(req.body, id);
  if (error) return res.status(error.status).json({ error: error.message });

  // clear fields that no longer apply to the new category
  if (!data.employee) existing.employee = undefined;
  if (data.category !== "salary") {
    existing.salaryMonth = undefined;
    existing.salaryYear = undefined;
  }

  existing.set(data);
  await existing.save();

  const populated = await Expense.findById(id)
    .populate(employeePopulate)
    .lean();

  res.json({ message: "Expense updated successfully", expense: populated });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "Invalid expense id" });
  }

  const deleted = await Expense.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "Expense not found" });

  res.json({ message: "Expense deleted successfully" });
});

module.exports = {
  createExpense,
  getExpenses,
  getExpenseSummary,
  getPayees,
  updateExpense,
  deleteExpense,
};
