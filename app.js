const express = require("express");
const cors = require("cors");
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const emailRoutes = require("./src/routes/email");
const userRoutes = require("./src/routes/user.js");
const productRoutes = require("./src/routes/products");
const otpRoutes = require("./src/routes/otp");
const quizRoutes = require("./src/routes/quiz");
const workshopRoutes = require("./src/routes/workshop");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/workshop", workshopRoutes);
app.use("/api/v1/user", userRoutes);

app.use("*", (req, res, next) => {
  const url = req.originalUrl;
  res.json({
    message: `${url} is not a valid endpoint`,
  });
});

app.use(errorHandler);

dbConnection();

app.listen(PORT, () => {
  console.log(`server running in http://localhost:${PORT}`);
});
