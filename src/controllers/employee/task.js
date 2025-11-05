const Task = require("../..//models/employee/task");
const Employee = require("../..//models/employee/employee");
const User = require("../../models/user");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { createNotification } = require("../../helpers/adda/createNotification");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const mapTaskToFrontend = (task) => ({
  id: task._id.toString(),
  title: task.title,
  description: task.description,
  deadline: task.deadline.toISOString(),
  createdAt: task.createdAt.toISOString(),
  assignedTo: task.assignedTo,
  assignedBy: task.assignedBy
    ? {
        _id: task.assignedBy._id || null,
        name: task.assignedBy.name || task.assignedByName || "Unknown",
      }
    : null,
  attachments: Array.isArray(task.attachments)
    ? task.attachments.map((img) => ({
        id: img._id.toString(),
        name: img.name,
        url: img.url,
        uploadedAt: img.uploadedAt,
      }))
    : [],
  status: task.status,
  priority: task.priority,
  submissionFailureReason: task.submissionFailureReason,
});

const mapEmployeeToFrontend = (employee, user) => ({
  _id: employee._id.toString(),
  name: user ? user.name : "Unknown",
  department: employee.department,
  role: employee.jobRole,
});

const fetchTasks = async (req, res) => {
  try {
    const { clerkRole, _id: userId } = req.user;
    const {
      employeeId,
      date,
      sortBy,
      sortOrder,
      status,
      searchTerm,
      page,
      limit = 10,
    } = req.query;

    let query = {};

    if (clerkRole === "EMPLOYEE") {
      const employee = await Employee.findOne({ user: userId });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee record not found for this user",
        });
      }
      query = { assignedTo: employee._id };
    } else if (employeeId && isValidObjectId(employeeId)) {
      query.assignedTo = employeeId;
    }

    if (
      status &&
      ["pending", "in-progress", "completed", "overdue"].includes(status)
    ) {
      query.status = status;
    }

    if (searchTerm) {
      const users = await User.find({
        name: { $regex: searchTerm, $options: "i" },
      }).select("_id");
      const employees = await Employee.find({
        $or: [
          { user: { $in: users.map((u) => u._id) } },
          { department: { $regex: searchTerm, $options: "i" } },
          { jobRole: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("_id");
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { assignedTo: { $in: employees.map((e) => e._id) } },
      ];
    }

    if (date) {
      const filterDate = new Date(date);
      if (!isNaN(filterDate.getTime())) {
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
        query.deadline = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid date format",
        });
      }
    }

    let sort = {};
    if (sortBy && ["createdAt", "submittedAt"].includes(sortBy)) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;
    } else if (sortBy) {
      return res.status(400).json({
        success: false,
        message: "Invalid sortBy value. Must be 'createdAt' or 'submittedAt'",
      });
    }

    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalTasks = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .populate("assignedBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
        message: "No tasks found",
      });
    }

    const frontendTasks = await Promise.all(
      tasks.map(async (task) => {
        const taskObj = task.toObject();

        let assignedToData = null;
        if (taskObj.assignedTo) {
          const employee = await Employee.findById(taskObj.assignedTo);
          let user = null;
          if (employee?.user) {
            user = await User.findById(employee.user).select("_id name");
          }

          assignedToData = {
            _id: employee?._id.toString() || null,
            name: user?.name || "Unknown",
            department: employee?.department || "Unknown",
            role: employee?.jobRole || "Unknown",
          };
        }

        const assignedByData = taskObj.assignedBy
          ? {
              _id: taskObj.assignedBy._id.toString(),
              name: taskObj.assignedBy.name || "Unknown",
            }
          : null;

        return mapTaskToFrontend({
          ...taskObj,
          assignedTo: assignedToData,
          assignedBy: assignedByData,
        });
      })
    );

    res.status(200).json({
      success: true,
      data: frontendTasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalTasks,
        totalPages: Math.ceil(totalTasks / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// Create a new task
const assignTask = async (req, res) => {
  try {
    console.log("🟢 Incoming request to assign task");
    console.log("📩 Request body:", req.body);
    console.log("👤 Authenticated user:", req.user?._id);

    const { title, description, deadline, assignedTo, priority } = req.body;

    // 🧩 Validation
    if (!title || !deadline || !assignedTo) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        message: "Missing required fields: title, deadline, assignedTo",
      });
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      console.warn("⚠️ Invalid deadline date:", deadline);
      return res.status(400).json({ message: "Invalid deadline date" });
    }

    const now = new Date();
    if (deadlineDate < now) {
      console.warn("⚠️ Deadline is in the past:", deadline);
      return res
        .status(400)
        .json({ message: "Deadline cannot be in the past" });
    }

    if (!isValidObjectId(assignedTo)) {
      console.warn("⚠️ Invalid assignedTo ID:", assignedTo);
      return res.status(400).json({ message: "Invalid assignedTo ID" });
    }

    if (priority && !["low", "medium", "high"].includes(priority)) {
      console.warn("⚠️ Invalid priority value:", priority);
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // 👥 Fetch employee
    console.log("🔍 Fetching employee:", assignedTo);
    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      console.warn("❌ Employee not found for assignedTo ID:", assignedTo);
      return res
        .status(404)
        .json({ message: "Employee not found for assignedTo ID" });
    }

    // 🏗️ Create new task
    console.log("📝 Creating new task...");
    const task = new Task({
      title,
      description: description || "",
      deadline: deadlineDate,
      assignedTo,
      assignedBy: req.user._id,
      status: "pending",
      attachments: [],
      priority: priority || "medium",
    });

    const savedTask = await task.save();
    console.log("✅ Task saved successfully:", savedTask._id);

    // 👤 Get assignedBy and assignedTo user details
    const assignedByUser = await User.findById(req.user._id).select("_id name");
    const assignedToUser = await User.findById(employee.user).select(
      "_id name"
    );

    console.log("👤 Assigned by:", assignedByUser?.name || "Unknown");
    console.log("👤 Assigned to:", assignedToUser?.name || "Unknown");

    // 🔔 Create notification
    console.log("📢 Creating task notification...");
    await createNotification(
      assignedToUser._id,
      "task_assigned",
      `${assignedByUser.name} has assigned you a task: "${title}"`,
      req.user._id,
      savedTask._id.toString(),
      "Task"
    );
    console.log("✅ Notification created successfully");

    // 🧠 Prepare frontend-friendly response
    const frontendTask = {
      _id: savedTask._id.toString(),
      title: savedTask.title,
      description: savedTask.description,
      deadline: savedTask.deadline.toISOString(),
      createdAt: savedTask.createdAt.toISOString(),
      assignedTo: {
        _id: employee._id.toString(),
        name: assignedToUser ? assignedToUser.name : "Unknown",
        department: employee.department,
        role: employee.jobRole,
      },
      assignedBy: assignedByUser
        ? {
            _id: assignedByUser._id.toString(),
            name: assignedByUser.name,
          }
        : null,
      attachments: [],
      status: savedTask.status,
      priority: savedTask.priority,
    };

    console.log("🎯 Final task response ready to send");

    res.status(201).json(frontendTask);
  } catch (error) {
    console.error("💥 Error creating task:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
};

const submitTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, attachments: bodyAttachments, failureReason } = req.body;
    const files = req.files;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!failureReason && new Date(task.deadline) < new Date()) {
      if (task.status === "overdue") {
        return res
          .status(400)
          .json({ message: "The deadline for this task has already passed." });
      } else {
        task.status = "overdue";
        await task.save();
        return res
          .status(400)
          .json({ message: "The deadline for this task has already passed." });
      }
    }

    if (failureReason) {
      task.submissionFailureReason = failureReason;
      task.status = "overdue";
      await task.save();
      return res.status(200).json({ message: "Failure reason saved." });
    }

    if (
      status &&
      !["pending", "in-progress", "completed", "overdue"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (status) task.status = status;

    const newAttachments = [];

    if (files && Array.isArray(files) && files.length > 0) {
      const fileAttachments = files.map((file) => ({
        name: file.originalname,
        url: `/uploads/${file.filename}`,
        uploadedAt: new Date().toISOString(),
      }));
      newAttachments.push(...fileAttachments);
    }

    if (bodyAttachments && Array.isArray(bodyAttachments)) {
      const linkAttachments = bodyAttachments
        .filter((att) => att.url && att.name)
        .map((att) => ({
          name: att.name,
          url: att.url,
          uploadedAt: new Date().toISOString(),
        }));
      newAttachments.push(...linkAttachments);
    }

    if (!Array.isArray(task.attachments)) task.attachments = [];
    if (newAttachments.length > 0) task.attachments.push(...newAttachments);

    const updatedTask = await task.save();

    const assignedByUser = await User.findById(task.assignedBy).select(
      "_id name"
    );

    const employee = await Employee.findById(task.assignedTo);
    let assignedToUserData = null;
    if (employee && employee.user) {
      const assignedToUser = await User.findById(employee.user).select(
        "_id name"
      );
      assignedToUserData = {
        _id: employee._id.toString(),
        name: assignedToUser ? assignedToUser.name : "Unknown",
        department: employee.department,
        role: employee.jobRole,
      };
    }

    if (assignedByUser) {
      const submittingUser = assignedToUserData;
      await createNotification(
        assignedByUser._id,
        "task_submitted",
        `${submittingUser.name} has submitted the task: "${task.title}"`,
        employee.user,
        task._id.toString(),
        "Task"
      );
    }

    const frontendTask = {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      deadline: updatedTask.deadline.toISOString(),
      createdAt: updatedTask.createdAt.toISOString(),
      assignedTo: assignedToUserData,
      assignedBy: assignedByUser
        ? {
            _id: assignedByUser._id.toString(),
            name: assignedByUser.name,
          }
        : null,
      attachments: Array.isArray(updatedTask.attachments)
        ? updatedTask.attachments.map((att) => ({
            id: att._id?.toString() || new mongoose.Types.ObjectId().toString(),
            name: att.name,
            url: att.url,
            uploadedAt: att.uploadedAt,
          }))
        : [],
      status: updatedTask.status,
      priority: updatedTask.priority,
    };

    res.status(200).json(frontendTask);
  } catch (error) {
    console.error("Error submitting task:", error);
    res.status(500).json({ message: "Failed to submit task" });
  }
};

// DELETE /employees/tasks/:taskId - Delete a task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!isValidObjectId(taskId)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    for (const image of task.submittedImages || []) {
      const filePath = path.join(__dirname, "../..", image.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await task.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Failed to delete task" });
  }
};

// PATCH /employees/tasks/:id/status - Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    if (!["pending", "in-progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = status;
    const updatedTask = await task.save();

    // Fetch assignedBy user
    const assignedByUser = await User.findById(updatedTask.assignedBy).select(
      "_id name"
    );

    // Fetch assignedTo employee and their user
    const employee = await Employee.findById(updatedTask.assignedTo);
    let assignedToUserData = null;
    if (employee && employee.user) {
      const assignedToUser = await User.findById(employee.user).select(
        "_id name"
      );
      assignedToUserData = {
        _id: employee._id.toString(),
        name: assignedToUser ? assignedToUser.name : "Unknown",
        department: employee.department,
        role: employee.jobRole,
      };
    }

    const frontendTask = {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      deadline: updatedTask.deadline.toISOString(),
      createdAt: updatedTask.createdAt.toISOString(),
      assignedTo: assignedToUserData,
      assignedBy: assignedByUser
        ? {
            _id: assignedByUser._id.toString(),
            name: assignedByUser.name,
          }
        : null,
      attachments: Array.isArray(updatedTask.attachments)
        ? updatedTask.attachments.map((img) => ({
            id: img._id.toString(),
            name: img.name,
            url: img.url,
            uploadedAt: img.uploadedAt,
          }))
        : [],
      status: updatedTask.status,
      priority: updatedTask.priority,
    };

    res.status(200).json(frontendTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ message: "Failed to update task status" });
  }
};

// DELETE /employees/tasks/:taskId/image/:imageId - Remove an image
const removeImage = async (req, res) => {
  try {
    const { taskId, imageId } = req.params;

    if (!isValidObjectId(taskId) || !isValidObjectId(imageId)) {
      return res.status(400).json({ message: "Invalid task ID or image ID" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const imageIndex = task.submittedImages.findIndex(
      (img) => img._id.toString() === imageId
    );
    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = task.attachments[imageIndex];
    const filePath = path.join(__dirname, "../..", image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    task.submittedImages.splice(imageIndex, 1);
    await task.save();
    res.status(204).send();
  } catch (error) {
    console.error("Error removing image:", error);
    res.status(500).json({ message: "Failed to remove image" });
  }
};

// Employee Controllers

// GET /employees - Fetch employees with sorting, searching, and pagination
const getEmployees = async (req, res) => {
  try {
    const {
      sortOrder = "asc",
      searchTerm = "",
      page = 1,
      limit = 100,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({ message: "Invalid page or limit" });
    }

    const query = {};
    if (searchTerm) {
      query.$or = [
        { department: { $regex: searchTerm, $options: "i" } },
        { jobRole: { $regex: searchTerm, $options: "i" } },
      ];
      const users = await User.find({
        name: { $regex: searchTerm, $options: "i" },
      }).select("_id");
      if (users.length > 0) {
        query.$or.push({ user: { $in: users.map((u) => u._id) } });
      }
    }

    const employees = await Employee.find(query)
      .populate("user", "name")
      .sort({ jobRole: sortOrder === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Employee.countDocuments(query);
    const frontendEmployees = employees.map((employee) =>
      mapEmployeeToFrontend(employee, employee.user)
    );

    res.status(200).json({
      employees: frontendEmployees,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// GET /employees/:id - Fetch an employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const employee = await Employee.findById(id).populate("user", "name");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json(mapEmployeeToFrontend(employee, employee.user));
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Failed to fetch employee" });
  }
};

// POST /employees - Create a new employee
const createEmployee = async (req, res) => {
  try {
    const { user, department, jobRole, salary } = req.body;

    if (!user || !department || !jobRole || !salary) {
      return res.status(400).json({
        message: "Missing required fields: user, department, jobRole, salary",
      });
    }

    if (!isValidObjectId(user)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userExists = await User.findById(user);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    if (
      ![
        "developer",
        "illustrator",
        "designer",
        "hr",
        "marketing",
        "finance",
        "sales",
      ].includes(department)
    ) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const employee = new Employee({
      user,
      department,
      jobRole,
      salary,
      active: false,
      inviteStatus: "pending",
    });

    const savedEmployee = await employee.save();
    const populatedEmployee = await Employee.findById(
      savedEmployee._id
    ).populate("user", "name");
    res
      .status(201)
      .json(mapEmployeeToFrontend(populatedEmployee, populatedEmployee.user));
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Failed to create employee" });
  }
};

// PATCH /employees/tasks/:id/extend
const extendTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDeadLine } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    if (!newDeadLine || isNaN(Date.parse(newDeadLine))) {
      return res
        .status(400)
        .json({ message: "Invalid or missing newDeadLine" });
    }

    const newDeadlineDate = new Date(newDeadLine);
    const now = new Date();

    if (newDeadlineDate < now) {
      return res
        .status(400)
        .json({ message: "New deadline cannot be in the past" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.deadline = newDeadlineDate;
    task.status = "pending";
    task.submissionFailureReason = null;

    const updatedTask = await task.save();

    const assignedByUser = await User.findById(updatedTask.assignedBy).select(
      "_id name"
    );
    const employee = await Employee.findById(updatedTask.assignedTo);
    let assignedToUserData = null;

    if (employee && employee.user) {
      const assignedToUser = await User.findById(employee.user).select(
        "_id name"
      );
      assignedToUserData = {
        _id: employee._id.toString(),
        name: assignedToUser ? assignedToUser.name : "Unknown",
        department: employee.department,
        role: employee.jobRole,
      };

      await createNotification(
        assignedToUser._id,
        "task_extended",
        `The deadline for task "${
          task.title
        }" has been extended to ${newDeadlineDate.toISOString()}`,
        assignedByUser ? assignedByUser._id : null,
        task._id.toString(),
        "Task"
      );
    }

    const frontendTask = {
      id: updatedTask._id.toString(),
      title: updatedTask.title,
      description: updatedTask.description,
      deadline: updatedTask.deadline.toISOString(),
      createdAt: updatedTask.createdAt.toISOString(),
      assignedTo: assignedToUserData,
      assignedBy: assignedByUser
        ? { _id: assignedByUser._id.toString(), name: assignedByUser.name }
        : null,
      attachments: Array.isArray(updatedTask.attachments)
        ? updatedTask.attachments.map((att) => ({
            id: att._id.toString(),
            name: att.name,
            url: att.url,
            uploadedAt: att.uploadedAt,
          }))
        : [],
      status: updatedTask.status,
      priority: updatedTask.priority,
    };

    res.status(200).json(frontendTask);
  } catch (error) {
    console.error("Error extending task:", error);
    res.status(500).json({ message: "Failed to extend task" });
  }
};

module.exports = {
  fetchTasks,
  assignTask,
  submitTask,
  deleteTask,
  updateTaskStatus,
  removeImage,
  getEmployees,
  getEmployeeById,
  createEmployee,
  extendTask,
};
