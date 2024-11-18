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
const userContributedPodcastRoutes = require("./src/routes/userContributionRoute.js");
const callRequestRoutes = require("./src/routes/callRequests.js");
const authorRoutes = require("./src/routes/author.js");
// const webhookRoutes = require("./src/routes/webhook.js");  
const evaluationRoutes = require("./src/routes/EvaluationForm.js");

const { Webhook, WebhookVerificationError } = require("svix");

const bodyParser = require("body-parser");
const dashboardRoutes = require("./src/routes/dashboard");
const dotenv = require("dotenv");
const {
  createUser,
  updateUser,
  deleteUser,
} = require("./src/helpers/userHelper.js");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
app.use(bodyParser.json());

// Webhook route
app.post("/api/v1/webhook/clerk", async (req, res) => {
  console.log("Request", req.body);
  const WEBHOOK_SECRET = process.env.VITE_CLERK_WEBHOOK_SECRET_KEY;

  if (!WEBHOOK_SECRET) {
    console.error("WEBHOOK_SECRET is not set in environment variables");
    return res.status(500).json({ error: "Server configuration error" });
  }

  // Get the headers
  const svix_id = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers:", {
      svix_id,
      svix_timestamp,
      svix_signature,
    });
    return res
      .status(400)
      .json({ error: "Error occurred -- missing Svix headers" });
  }

  // Get the body
  const payload = req.body;
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    // Webhook verified successfully
    const eventType = evt.type;
    switch (eventType) {
      case "user.created":
        await createUser(evt.data);
        break;
      case "user.updated":
        await updateUser(evt.data);
        break;
      case "user.deleted":
        await deleteUser(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    res.status(200).end();
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      console.error("Webhook verification failed:", err.message);
      console.error("Received headers:", req.headers);
      console.error("Received body:", body);
    } else {
      console.error("Unexpected error during webhook processing:", err);
    }
    res
      .status(400)
      .json({ error: "Webhook verification failed", details: err.message });
  }
});

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
// app.use("/api/v1/webhook", webhookRoutes);
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
app.use("/api/v1/userContribution", userContributedPodcastRoutes);
app.use("/api/v1/call-requests", callRequestRoutes);
app.use("/api/v1/author", authorRoutes);
app.use("/api/v1/evaluation", evaluationRoutes);

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
