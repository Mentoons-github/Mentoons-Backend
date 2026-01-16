const { Webhook, WebhookVerificationError } = require("svix");
const User = require("../../models/user");
const Employee = require("../../models/employee/employee.js");
const {
  createUser,
  updateUser,
  deleteUser,
} = require("../../helpers/userHelper.js");
const { loginEmployee } = require("../../helpers/employee/auth.js");

const clerkWebhook = async (req, res) => {
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
        const newUser = await createUser(evt.data);

        const email =
          evt.data.primary_email_address?.email_address ||
          evt.data.email_addresses?.[0]?.email_address;

        if (email) {
          const employee = await Employee.findOne({
            "user.email": email,
            inviteStatus: "pending",
          });
          if (employee) {
            employee.user = newUser._id;
            employee.inviteStatus = "accepted";
            await employee.save();
            console.log(`Employee linked with Clerk user ${evt.data.id}`);
          }
        }

        break;
      case "user.updated":
        await updateUser(evt.data);
        break;
      case "user.deleted":
        await deleteUser(evt.data);
        break;
      case "session.created":
        const { id, email_addresses } = evt.data;
        const userEmail = email_addresses[0]?.email_address;

        const user = await User.findOne({ clerkId: id, email: userEmail });
        if (user && user.role === "EMPLOYEE") {
          await loginEmployee(evt.data);
        }
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
};

module.exports = clerkWebhook;
