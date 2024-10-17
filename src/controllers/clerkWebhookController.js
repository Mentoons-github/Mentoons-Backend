const { Webhook, WebhookVerificationError } = require("svix");

const bodyParser = require("body-parser");

const dotenv = require("dotenv");

const asyncHandler = require("../utils/asyncHandler.js");
const { createUser, updateUser, deleteUser } = require("../helpers/userHelper.js");
dotenv.config();
app.use(bodyParser.json());

module.exports = {
  clerkWebhookController: asyncHandler(async (req, res, next) => {
    const WEBHOOK_SECRET = process.env.VITE_CLERK_WEBHOOK_SECRET_KEY;

    if (!WEBHOOK_SECRET) {
      console.error("WEBHOOK_SECRET is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

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

    const payload = req.body;
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    try {
      const evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });

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
  }),
};
