const express = require("express");
const cors = require("cors");
const multer = require("multer");
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const emailRoutes = require("./src/routes/email");
const userRoutes = require("./src/routes/user.js");
const productRoutes = require("./src/routes/products");
const otpRoutes = require("./src/routes/otp");
const quizRoutes = require("./src/routes/quiz");
const workshopRoutes = require("./src/routes/workshop");
const whatsappRoutes = require("./src/routes/whatsapp.js");
const adminRoutes = require("./src/routes/admin.js");
const uploadRoutes = require("./src/routes/upload.js");
const careerRoutes = require("./src/routes/career");
const webhookRoutes = require("./src/routes/webhook.js");


const dashboardRoutes = require("./src/routes/dashboard");
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/whatsapp", whatsappRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/otp", otpRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/workshop", workshopRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/upload", upload.single("file"), uploadRoutes);
app.use("/api/v1/career", careerRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/webhook", webhookRoutes);
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
