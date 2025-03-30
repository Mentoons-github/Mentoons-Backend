const requireAuth = require("@clerk/express");

const conditionalAuth = async (req, res, next) => {
  try {
    const { type } = req.query;
    if (type === "downloads") {
      return next();
    }

    console.log("req query :", req.query)
    console.log(type);

    return requireAuth()(req, res, next);
  } catch (error) {
    return res.status(404).json({ message: "User is not authorized", error });
  }
};

module.exports = conditionalAuth;
