const socketIo = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/adda/message");
const Notification = require("../models/adda/notification");
const { clerk } = require("../middlewares/auth.middleware");
const Conversations = require("../models/adda/conversation");

const socketSetup = (server) => {
  console.log("socket connecting");
  const io = socketIo(server, {
    cors: {
      origin: [
        "https://mentoons.com",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //Auth
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("entering to middleware");
    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const session = await clerk.verifyToken(token);
      const clerkId = session.sub;

      const user = await User.findOneAndUpdate(
        { clerkId },
        { $addToSet: { socketIds: socket.id } },
        { new: true }
      );

      if (!user) {
        return next(new Error("User not found in DB"));
      }

      socket.userId = user._id;
      next();
    } catch (err) {
      console.error("Socket token verification error:", err);
      return next(new Error("Invalid token"));
    }
  });

  //connection
  io.on("connection", (socket) => {
    console.log(
      `socket is connected with socket id ${socket.id}, user is ${socket.userId}`
    );

    broadCastOnlineUsers(io);

    //send message
    socket.on(
      "send_message",
      async ({ conversationId, receiverId, message }) => {
        try {
          const conversation = await Conversations.findById(conversationId);
          if (!conversation || !conversation.members.includes(socket.userId)) {
            return socket.emit("error", {
              message: "Unauthorized conversation access",
            });
          }

          const chat = await Chat.create({
            senderId: socket.userId,
            receiverId,
            message,
          });

          const receiver = await User.findById(receiverId);
          if (receiver && receiver.socketIds.length > 0) {
            receiver.socketIds.forEach((id) => {
              io.to(id).emit("receive_message", {
                chatId: chat._id,
                senderId: socket.userId,
                message,
                timestamp: chat.createdAt,
              });
            });
          } else {
            console.log("Receiver is offline message stored in Database");
          }
        } catch (err) {
          console.log("Error sending message :", err);
        }
      }
    );

    //notification
    socket.on(
      "new_notification",
      async ({ message, receiverId, type, referenceId, referenceModel }) => {
        try {
          const notificationData = {
            userId: receiverId,
            message,
            isRead: false,
            type,
            initiatorId: socket.userId,
          };

          if (referenceId) notificationData.referenceId = referenceId;
          if (referenceModel) notificationData.referenceModel = referenceModel;

          const notification = await Notification.create(notificationData);

          const receiver = await User.findById(receiverId);

          if (receiver && receiver.socketIds.length > 0) {
            receiver.socketIds.forEach((id) => {
              io.to(id).emit("receive_notification", notification);
            });
          } else {
            console.log("user is offline notification saved in Database");
          }
        } catch (err) {
          console.log(err);
        }
      }
    );

    //disconnect
    socket.on("disconnect", async () => {
      console.log("a user disconnected");
      await User.findByIdAndUpdate(socket.userId, {
        $pull: { socketIds: socket.id },
      });
      broadCastOnlineUsers(io);
    });
  });

  return io;
};

//passing online users
const broadCastOnlineUsers = async (io) => {
  const onlineUsers = await User.find({
    socketIds: { $exists: true, $ne: [] },
  });

  io.emit("online_users", onlineUsers);
};

module.exports = socketSetup;
