const Badge = require("../../models/adda/badge");
const User = require("../../models/user");
const asyncHandler = require("../../utils/asyncHandler");

//Badge Creation
const badgeCreation = asyncHandler(async (req, res) => {
  console.log("badge creation");
  const { data } = req.body;

  const errors = {};

  Object.entries(data).forEach(([key, value]) => {
    if (value === "") {
      errors[key] = `Please fill ${key}`;
    }

    if (key === "criteria") {
      if (typeof value === "object" && value !== null) {
        if (!value.action || value.action.trim() === "") {
          errors["action"] = "Please fill the action in criteria";
        }

        if (!value.field || value.field.trim() === "") {
          errors["field"] = "Please fill the field in criteria";
        }

        if (!value.operator || value.operator.trim() === "") {
          errors["operator"] = "Please fill the operator in criteria";
        }

        if (
          value.value === undefined ||
          value.value === null ||
          value.value === "" ||
          isNaN(Number(value.value))
        ) {
          errors["value"] = "Please provide a valid number for value";
        }
      }
    }
  });

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ message: errors });
  }

  await Badge.create(data);
  return res.status(200).json({ message: "Badge created successfully" });
});

//badgeDelete
const deleteBadge = asyncHandler(async (req, res) => {
  const { id } = req.params;
  console.log("delete confirmation");
  console.log(id);

  const badge = await Badge.findByIdAndDelete(id);

  if (!badge) {
    return res.status(404).json({ message: "No badge found" });
  }

  return res.status(200).json({ message: "Badge deleted successfully" });
});

const getUserBadges = asyncHandler(async (req, res) => {
  const { role, dbUser } = req.user;
  const userId = dbUser._id;

  console.log("badge reached");
  console.log(role);

  let badges;

  if (role.toLowerCase() === "admin") {
    badges = await Badge.find();

    return res.status(200).json({
      badges,
    });
  } else {
    const user = await User.findById(userId)
      .select("badges")
      .populate("badges.badge");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      badges: user.badges,
    });
  }
});

module.exports = {
  badgeCreation,
  deleteBadge,
  getUserBadges,
};
