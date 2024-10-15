const { deleteUser, updateUser, createUser } = require("../helpers/userHelper");

const asyncHandler = require("../utils/asyncHandler");
const { Webhook } = require("svix");

module.exports = {
  clerkWebhookConroller: asyncHandler(async (req, res) => {
    try {
      console.log("controller", req);

      const payloadString = req.body.toString();
      const svixHeaders = req.headersi;
      const wh = new Webhook(process.env.VITE_CLERK_WEBHOOK_SECRET_KEY);
      const evt = wh.verify(payloadString, svixHeaders);
      const { id, ...attributes } = evt.data;
      console.log("EventDATA", evt.data);
      let mongoUser = {};

      const eventType = evt.type;

      switch (eventType) {
        case "user.created":
          mongoUser = await createUser(evt.data);
          break;
        case "user.updated":
          mongoUser = await updateUser(evt.data);
          break;
        case "user.deleted":
          mongoUser = await deleteUser(evt.data);
          break;
        default:
          console.log(`Unhandled event type: ${eventType}`);
      }

      res.status(200).send(mongoUser);
    } catch (error) {
      console.error("Webhook verification failed:", error);
      res.status(400).send({ success: false, error: error.message });
    }
  }),
};
