const { deleteUser, updateUser, createUser } = require("../helpers/userHelper");
const User = require("../model/user");

module.exports = {
  clerkWebhookConroller: asyncHandler(async (req, res) => {
    try {
      // Verify webhook signature and extract event
      const event = clerkWebhook.verify(req);
      let mongoUser = {};

      // Handle different event types
      switch (event.type) {
        case "user.created":
          mongoUser = await createUser(event.data);
          break;
        case "user.updated":
          mongoUser = await updateUser(event.data);
          break;
        case "user.deleted":
          mongoUser = await deleteUser(event.data);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Webhook verification failed:", error);
      res
        .status(400)
        .send({ success: false, error: "Webhook verification failed" });
    }
  }),
};
