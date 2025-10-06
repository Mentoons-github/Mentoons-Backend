const { default: clerkClient } = require("@clerk/clerk-sdk-node");
const asyncHandler = require("../../utils/asyncHandler");
const Employee = require("../../models/employee/employee");

const createInvitation = asyncHandler(async (req, res) => {
  console.log("Request body:", req.body);

  const { department, salary, active, user } = req.body;

  if (!user || typeof user !== "object") {
    return res.status(400).json({ error: "User object is required" });
  }

  const { name, email, role = "EMPLOYEE", picture, gender } = user;

  if (!name || !email || !department || !salary) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  console.log("Creating employee with email:", email);

  let invitation;

  try {
    invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `http://localhost:3000/add-password?invitationId=${invitation?.id}`,
      publicMetadata: { role },
      notify: true,
    });
  } catch (error) {
    console.error("Clerk invitation error:", error.errors || error);

    if (error.errors?.[0]?.code === "form_identifier_exists") {
      return res.status(200).json({
        success: true,
        message: "Mail has already been sent to set the password",
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.errors?.[0]?.message ||
        "Failed to create invitation. Check the email and try again.",
    });
  }

  try {
    // Create employee in Mongo
    const employee = await Employee.create({
      department,
      salary,
      active: active || false,
      inviteId: invitation.id,
      inviteStatus: "pending",
      user: null,
      name,
      email,
      picture,
      gender,
    });

    res.status(201).json({ success: true, invitation, employee });
  } catch (mongoError) {
    console.error("MongoDB error:", mongoError);

    // Check for duplicate key error (email already exists)
    if (mongoError.code === 11000 && mongoError.keyPattern?.email) {
      return res.status(200).json({
        success: true,
        message: "Mail has already been sent to set the password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create employee record",
    });
  }
});

const setPassword = asyncHandler(async (req, res) => {
  const { invitationId, password } = req.body;

  if (!invitationId || !password) {
    return res.status(400).json({
      success: false,
      message: "InvitationId and password are required",
    });
  }

  try {
    const invitation = await clerkClient.invitations.acceptInvitation(
      invitationId
    );

    const email = invitation.emailAddress;
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });

    if (!users || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found in Clerk after accepting invitation",
      });
    }

    const user = users[0];

    await clerkClient.users.updateUser(user.id, {
      password,
    });

    return res.json({
      success: true,
      message: "Password set successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Set password error:", error);
    return res.status(400).json({
      success: false,
      message: error.errors?.[0]?.message || "Failed to set password",
    });
  }
});

module.exports = {
  createInvitation,
  setPassword,
};
