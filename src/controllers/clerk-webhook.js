const { deleteUser, updateUser, createUser } = require("../helpers/userHelper");
const dotenv = require("dotenv");
const asyncHandler = require("../utils/asyncHandler");
const { Webhook } = require("svix");
dotenv.config();

module.exports = {
  clerkWebhookController: asyncHandler(async (req, res) => {
    const WEBHOOK_SECRET = process.env.VITE_CLERK_WEBHOOK_SECRET_KEY;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res
        .status(400)
        .json({ error: "Error occurred -- no svix headers" });
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
      console.log(`Webhook with an ID of ${evt.id} and type of ${eventType}`);
      console.log("Webhook body:", body);

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

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Webhook verification failed:", error);
      res.status(400).send({ success: false, error: error.message });
    }
  }),
};
