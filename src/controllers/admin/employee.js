const { default: clerkClient } = require("@clerk/clerk-sdk-node");
const asyncHandler = require("../../utils/asyncHandler");
const Employee = require("../../models/employee/employee");
const User = require("../../models/user");
const { sendEmail } = require("../../services/emailService");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { getWelcomeEmailTemplate } = require("../../emailTemplates/setPassword");

const createInvitation = asyncHandler(async (req, res) => {
  console.log("Received request body:", req.body);
  const { department, salary, active, user, jobRole } = req.body;

  if (!user || typeof user !== "object") {
    console.log("Error: User object missing or invalid");
    return res
      .status(400)
      .json({ success: false, message: "User information is required" });
  }

  const { name, email, role = "EMPLOYEE", gender, phoneNumber } = user;

  if (!name || !email || !department || !phoneNumber) {
    console.log("Error: Missing required fields", {
      name,
      email,
      department,
      jobRole,
    });
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  const session = await User.startSession();
  session.startTransaction();

  let clerkUser = null;
  let createdClerkUser = false;

  try {
    console.log("Checking if Clerk user exists for email:", email);

    const existingClerkUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (existingClerkUsers.data && existingClerkUsers.data.length > 0) {
      clerkUser = existingClerkUsers.data[0];
      console.log("Clerk user already exists:", clerkUser.id);

      const existingDbUser = await User.findOne({ email }).session(session);

      if (existingDbUser) {
        const userRole = existingDbUser.role;

        if (!userRole || userRole === "USER") {
          console.log("Error: Email already used by a regular user");
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message:
              "⚠️ This email is already being used by a regular user account. Please use a different email address to create an employee account.",
          });
        }

        if (userRole === "ADMIN") {
          console.log("Error: Cannot create employee for ADMIN user");
          await session.abortTransaction();
          return res.status(403).json({
            success: false,
            message:
              "⚠️ This email belongs to an admin account. Admin accounts cannot be converted to employee accounts.",
          });
        }

        if (userRole === "EMPLOYEE") {
          const existingEmployee = await Employee.findOne({
            user: existingDbUser._id,
          }).session(session);
          if (existingEmployee) {
            console.log("Error: Email already used by an employee");
            await session.abortTransaction();
            return res.status(400).json({
              success: false,
              message:
                "⚠️ This email is already being used by another employee. Please use a different email address.",
            });
          }
        }
      }
    } else {
      console.log("Creating new Clerk user for email:", email);

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName =
        nameParts.length > 1 ? nameParts.slice(1).join(" ") : nameParts[0];

      const tempPassword = crypto.randomBytes(16).toString("hex");

      const newUserData = {
        emailAddress: [email],
        firstName: firstName,
        lastName: lastName,
        password: tempPassword,
        skipPasswordRequirement: true,
      };

      try {
        clerkUser = await clerkClient.users.createUser(newUserData);
        createdClerkUser = true;
        console.log("Clerk user created:", clerkUser.id);
      } catch (clerkError) {
        console.error("Clerk API error details:", {
          status: clerkError.status,
          message: clerkError.message,
          errors: clerkError.errors,
          clerkTraceId: clerkError.clerkTraceId,
        });
        throw clerkError;
      }
    }

    console.log("Checking local DB for user with email:", email);
    let dbUser = await User.findOne({ email }).session(session);
    console.log("existing user: ", dbUser);

    if (dbUser && !clerkUser) {
      if (!dbUser.role || dbUser.role === "USER") {
        console.log("Error: Email already used by a regular user in database");
        await session.abortTransaction();

        if (createdClerkUser && clerkUser) {
          try {
            await clerkClient.users.deleteUser(clerkUser.id);
            console.log("Rolled back Clerk user creation");
          } catch (deleteError) {
            console.error(
              "Failed to delete Clerk user during rollback:",
              deleteError
            );
          }
        }

        return res.status(400).json({
          success: false,
          message:
            "⚠️ This email is already being used by a regular user account. Please use a different email address to create an employee account.",
        });
      }

      if (dbUser.role === "ADMIN") {
        console.log("Error: Cannot create employee for ADMIN user in database");
        await session.abortTransaction();

        if (createdClerkUser && clerkUser) {
          try {
            await clerkClient.users.deleteUser(clerkUser.id);
            console.log("Rolled back Clerk user creation");
          } catch (deleteError) {
            console.error(
              "Failed to delete Clerk user during rollback:",
              deleteError
            );
          }
        }

        return res.status(403).json({
          success: false,
          message:
            "⚠️ This email belongs to an admin account. Admin accounts cannot be converted to employee accounts.",
        });
      }

      if (dbUser.role === "EMPLOYEE") {
        const existingEmployee = await Employee.findOne({
          user: dbUser._id,
        }).session(session);
        if (existingEmployee) {
          console.log("Error: Employee already exists with this email");
          await session.abortTransaction();

          if (createdClerkUser && clerkUser) {
            try {
              await clerkClient.users.deleteUser(clerkUser.id);
              console.log("Rolled back Clerk user creation");
            } catch (deleteError) {
              console.error(
                "Failed to delete Clerk user during rollback:",
                deleteError
              );
            }
          }

          return res.status(400).json({
            success: false,
            message:
              "⚠️ This email is already being used by another employee. Please use a different email address.",
          });
        }
      }
    }

    if (!dbUser) {
      console.log("Creating new local user");
      const [newUser] = await User.create(
        [
          {
            name,
            email,
            gender,
            phoneNumber,
            role,
            clerkId: clerkUser.id,
          },
        ],
        { session }
      );
      dbUser = newUser;
      console.log("Local user created:", dbUser._id);
    } else if (!dbUser.clerkId) {
      console.log("Updating local user with Clerk ID");
      dbUser.clerkId = clerkUser.id;
      await dbUser.save({ session });
      console.log("Local user updated with Clerk ID:", dbUser.clerkId);
    }

    console.log("Generating password setup key and expiry");
    const passwordSetupKey = crypto.randomBytes(20).toString("hex");
    const passwordSetupExpires = Date.now() + 24 * 60 * 60 * 1000;

    console.log("Creating employee record");
    const [employee] = await Employee.create(
      [
        {
          department,
          salary,
          active: active || false,
          inviteStatus: "pending",
          jobRole,
          user: dbUser._id,
          passwordSetupKey,
          passwordSetupExpires,
        },
      ],
      { session }
    );
    console.log("Employee created:", employee._id);

    console.log("Preparing invitation email for:", email);
    const emailContent = getWelcomeEmailTemplate(
      name,
      process.env.FRONTEND_URL || "http://localhost:3000",
      passwordSetupKey,
      employee._id
    );

    const mailOptions = {
      from: '"Mentoons HR Team" <hr@mentoons.com>',
      to: email,
      subject: "Welcome to Mentoons - Complete Your Account Setup",
      ...emailContent,
    };

    console.log("Sending email...");
    await sendEmail(mailOptions);
    console.log("Invitation email sent successfully");

    await session.commitTransaction();
    console.log("Transaction committed successfully");

    res.status(201).json({
      success: true,
      message: "Invitation email sent successfully! 🎉",
      employee,
    });
  } catch (error) {
    await session.abortTransaction();
    console.log("Transaction aborted due to error");

    if (createdClerkUser && clerkUser) {
      try {
        await clerkClient.users.deleteUser(clerkUser.id);
        console.log("Rolled back Clerk user creation");
      } catch (deleteError) {
        console.error(
          "Failed to delete Clerk user during rollback:",
          deleteError
        );
      }
    }

    console.error("Error creating employee or sending email:", error);
    if (error.errors[0].code === "form_identifier_exists") {
      return res.status(500).json({
        success: false,
        message: error.errors[0].message,
        error: error.errors[0].longMessage,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: error,
        error: error.message,
      });
    }
  } finally {
    session.endSession();
  }
});

const setPassword = asyncHandler(async (req, res) => {
  const { key, password } = req.body;

  if (!key || !password) {
    return res.status(400).json({
      success: false,
      message: "Password setup key and password are required",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long",
    });
  }

  const employee = await Employee.findOne({ passwordSetupKey: key }).populate(
    "user"
  );

  if (!employee) {
    return res.status(400).json({
      success: false,
      message: "Invalid password setup key",
    });
  }

  if (employee.inviteStatus === "accepted") {
    return res.status(400).json({
      success: false,
      message: "This password setup link has already been used.",
    });
  }

  if (Date.now() > employee.passwordSetupExpires) {
    try {
      if (employee.user) {
        const user = await User.findById(employee.user);
        if (user?.clerkId) {
          await clerkClient.users.deleteUser(user.clerkId);
        }
        await User.findByIdAndDelete(employee.user);
      }
      await Employee.findByIdAndDelete(employee._id);
    } catch (cleanupError) {
      console.error("Error cleaning up expired invitation:", cleanupError);
    }

    return res.status(400).json({
      success: false,
      message:
        "Password setup link has expired. Please contact HR for a new invitation.",
    });
  }

  const user = employee.user || (await User.findById(employee.user));
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not found",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    if (user.clerkId) {
      try {
        await clerkClient.users.updateUser(user.clerkId, {
          password,
          publicMetadata: {
            ...user.publicMetadata,
            role: "EMPLOYEE",
          },
        });
      } catch (clerkError) {
        console.error("Error updating Clerk password:", clerkError);
      }
    }

    employee.inviteStatus = "accepted";
    employee.passwordSetupKey = undefined;
    employee.passwordSetupExpires = undefined;
    employee.inviteAcceptedAt = new Date();
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Password set successfully and invitation accepted",
      employee: {
        _id: employee._id,
        department: employee.department,
        jobRole: employee.jobRole,
        inviteStatus: employee.inviteStatus,
      },
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error setting password:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to set password. Please try again.",
    });
  }
});

const handleProfileEditRequest = async (req, res) => {

  try {
    const adminId = req.user?._id;
    const { id: employeeId } = req.params;
    const { action } = req.body;

    if (!action || !["approved", "rejected"].includes(action)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid action type" });
    }

    const employee = await Employee.findById(employeeId);
  
    if (!employee) {
      return res.status(404).json({ message: "No user found" });
    }

    const { requestedAt } = employee.profileEditRequest || {}

    employee.profileEditRequest = {
      adminId,
      approvedAt: action === "approved" ? new Date() : null,
      status: action,
      requestedAt: requestedAt || new Date(),
    };

    await employee.save();

    return res.status(200).json({
      success: true,
      message: `Profile edit request ${action} successfully.`,
      data: employee,
    });
  } catch (error) {
    console.error("Error in handleProfileEditRequest:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to set accept profile edit of user. Please try again.",
    });
  }
};

module.exports = {
  createInvitation,
  setPassword,
  handleProfileEditRequest,
};
