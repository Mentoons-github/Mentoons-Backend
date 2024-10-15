const { deleteUser, updateUser, createUser } = require("../helpers/userHelper");

const asyncHandler = require("../utils/asyncHandler");

module.exports = {
  clerkWebhookConroller: asyncHandler(async (req, res) => {
    try {
      console.log("controller", req);

      const { type, data } = req.body;
      consoe.log("eventType", type);
      consoe.log("eventDATA", data);
      let mongoUser = {};

      switch (type) {
        case "user.created":
          mongoUser = await createUser(data);
          break;
        case "user.updated":
          mongoUser = await updateUser(data);
          break;
        case "user.deleted":
          mongoUser = await deleteUser(data);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).send({ success: true });
    } catch (error) {
      console.error("Webhook verification failed:", error);
      res.status(400).send({ success: false, error: error.message });
    }
  }),
};
