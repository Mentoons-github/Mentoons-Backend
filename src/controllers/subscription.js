const User = require("../models/user");

const limits = {
  free: { comics: 5, audioComics: 5, podcasts: 5 },
  prime: { comics: 10, audioComics: 15, podcasts: 10 },
  platinum: { comics: 20, audioComics: 30, podcasts: 18 },
};

const checkAccess = (user, type, itemId) => {
  const plan = user.subscription?.plan?.toLowerCase();

  console.log("Checking access for:");
  console.log("User subscription plan:", plan);
  console.log("Content type:", type);
  console.log("Item ID:", itemId);

  if (!user.accessed[type]) user.accessed[type] = [];

  const accessedItems = user.accessed[type];

  if (!limits[plan]) {
    console.error("❌ Invalid subscription type:", user.subscription);
    return { access: false, reason: "invalid_plan" };
  }

  if (!limits[plan][type]) {
    console.error("❌ Invalid content type for subscription:", type);
    return { access: false, reason: "invalid_type" };
  }

  const currentLimit = limits[plan][type];
  console.log("Current limit for this type:", currentLimit);
  console.log("Already accessed items:", accessedItems);

  if (accessedItems.includes(itemId)) {
    return { access: true };
  }

  if (accessedItems.length < currentLimit) {
    accessedItems.push(itemId);
    console.log("✅ Access granted. Item pushed:", itemId);
    console.log("📦 New accessed items array:", accessedItems);
    return { access: true, update: true };
  }

  if (plan === "platinum") {
    return { access: false, reason: "charge" };
  }

  return { access: false, reason: "upgrade" };
};

const productAccessCheck = async (req, res) => {
  const userId = req.user;
  const { type, itemId } = req.body;

  const validTypes = ["comics", "audioComics", "podcasts"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: "Invalid content type." });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  let saveRequired = false;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (user.subscriptionStartDate < oneYearAgo) {
    user.subscription = "Free";
    user.accessed = { comics: [], audioComics: [], podcasts: [] };
    user.subscriptionStartDate = new Date();
    saveRequired = true;
  }

  const result = checkAccess(user, type, itemId);
  if (result.update) saveRequired = true;

  if (saveRequired) await user.save();

  return res.json(result);
};

module.exports = {
  productAccessCheck,
};
