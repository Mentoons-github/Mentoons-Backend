const express = require("express");
const cors = require("cors");
const dbConnection = require("./src/config/dbConfig");
const errorHandler = require("./src/middlewares/errorHandler");
const morgan = require("morgan");

require("./src/cron/sessionNotifer.js");

const emailRoutes = require("./src/routes/email");
const userRoutes = require("./src/routes/user.js");
const productRoutes = require("./src/routes/product.routes.js");
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
const reviewRoutes = require("./src/routes/review");
const skuRoutes = require("./src/routes/cardProductRoutes.js");
const upload = require("./src/middlewares/uploadFileMiddleware.js");
const cartRoutes = require("./src/routes/cartRoutes.js");
const paymentRoutes = require("./src/routes/paymentRoutes.js");
const mythosCommentRoutes = require("./src/routes/mythosComment.routes.js");
const commentRoutes = require("./src/routes/comment.routes.js");
const postRoutes = require("./src/routes/post.routes.js");
const likeRoutes = require("./src/routes/like.routes.js");
const shareRoutes = require("./src/routes/share.routes.js");
const feedRoutes = require("./src/routes/feed.routes.js");
const memeRoutes = require("./src/routes/adda/meme.routes.js");
const memeFeedRoutes = require("./src/routes/adda/memeFeed.routes.js");
const rewardRoutes = require("./src/routes/rewardRoutes.js");
const adminRewardRoutes = require("./src/routes/adminRewardRoutes.js");
const reactionRoutes = require("./src/routes/reactionRoutes");
const orderRouter = require("./src/routes/orders.routes.js");
const conversationRouter = require("./src/routes/adda/conversation.routes.js");
// const webhookRoutes = require("./src/routes/webhook.js");
const evaluationRoutes = require("./src/routes/EvaluationForm.js");
const { clerkMiddleware } = require("@clerk/express");
const ensureUserExists = require("./src/middlewares/ensureUserExists");
const { Webhook, WebhookVerificationError } = require("svix");

const bodyParser = require("body-parser");
const dashboardRoutes = require("./src/routes/dashboard");
const dotenv = require("dotenv");
const {
  createUser,
  updateUser,
  deleteUser,
} = require("./src/helpers/userHelper.js");
const queryRoutes = require("./src/routes/query.routes.js");
const User = require("./src/models/user");
const sessionRoute = require("./src/routes/session.js");
const addaRouter = require("./src/routes/adda.routes.js");
const { socketSetup } = require("./src/socket/socket.js");
const influencerJobRequestRoutes = require("./src/routes/influencerJobRequest.routes.js");
// const { requireAuth } = require("@clerk/express");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
app.use(
  cors({
    origin: [
      "https://mentoons.com",
      "http://localhost:3000",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: [
      "Cross-Origin-Opener-Policy",
      "Cross-Origin-Resource-Policy",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
  })
);

app.use(clerkMiddleware());

app.use(bodyParser.json());

// Webhook route

// app.use(ensureUserExists);
app.post("/api/v1/webhook/clerk", ensureUserExists, async (req, res) => {
  console.log("Request", req.body);
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET_KEY;

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

    console.log("event type :", eventType);
    switch (eventType) {
      case "user.created":
        // Check if user already exists (for idempotency)
        const existingUser = await User.findOne({ clerkId: evt.data.id });
        if (existingUser) {
          console.log(`User ${data.id} already exists, skipping creation`);
          return res
            .status(200)
            .json({ received: true, status: "user_exists" });
        }
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

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("views", __dirname + "/public");
app.engine("html", require("ejs").renderFile);
app.use("/api/v1/adda", addaRouter);
app.use("/api/v1/influencer-requests", influencerJobRequestRoutes);
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
app.use("/api/v1/review", reviewRoutes);
app.use("/api/v1/sku", skuRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/sessionbookings", sessionRoute);
app.use("/api/v1/query", queryRoutes);
app.use("/api/v1/mythosComment", mythosCommentRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/likes", likeRoutes);
app.use("/api/v1/shares", shareRoutes);
app.use("/api/v1/feeds", feedRoutes);
app.use("/api/v1/memes", memeRoutes);
app.use("/api/v1/memeFeed", memeFeedRoutes);
app.use("/api/v1/rewards", rewardRoutes);
app.use("/api/v1/admin/rewards", adminRewardRoutes);
app.use("/api/v1/reactions", reactionRoutes);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/conversation", conversationRouter);
app.use("/health", (req, res) => {
  res.json({
    message: "The server is running successfully",
  });
});

app.use(errorHandler);

app.use("*", (req, res, next) => {
  const url = req.originalUrl;
  res.json({
    message: `${url} is not a valid endpoint`,
  });
});

dbConnection();

const server = app.listen(PORT, () => {
  console.log(`server running in http://localhost:${PORT}`);
});

socketSetup(server);
