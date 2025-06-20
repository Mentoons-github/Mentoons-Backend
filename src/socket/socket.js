const socketIo = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/adda/message");
const Notification = require("../models/adda/notification");
const { clerk } = require("../middlewares/auth.middleware");
const Conversations = require("../models/adda/conversation");

let io;

const socketSetup = (server) => {
  console.log("socket connecting");
  io = socketIo(server, {
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

    //sample
    socket.emit("hello", "hey hello");

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
            conversationId,
            senderId: socket.userId,
            receiverId,
            message,
            isDelivered: false,
          });

          const receiver = await User.findById(receiverId);
          if (receiver && receiver.socketIds.length > 0) {
            receiver.socketIds.forEach((id) => {
              io.to(id).emit("receive_message", {
                chatId: chat._id,
                senderId: socket.userId,
                conversationId: conversationId,
                message,
                timestamp: chat.createdAt,
              });
            });

            chat.isDelivered = true;
            await chat.save();
          } else {
            console.log("Receiver is offline message stored in Database");
          }
        } catch (err) {
          console.log("Error sending message :", err);
        }
      }
    );

    //typing...
    socket.on("typing", async ({ receiverId, conversationId }) => {
      const receiver = await User.findById(receiverId);

      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("typing", {
            conversationId,
            userId: socket.userId,
          });
        });
      }
    });

    socket.on("stopped_typing", async ({ receiverId, conversationId }) => {
      const receiver = await User.findById(receiverId);

      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("stopped_typing", {
            conversationId,
            userId: socket.userId,
          });
        });
      }
    });

    //mark as Read
    socket.on("mark_as_read", async ({ conversationId }) => {
      const userId = socket.userId;
      await Chat.updateMany(
        { conversationId, receiverId: userId, isRead: { $ne: true } },
        { $set: { isRead: true } }
      );

      io.emit("messages_read", { conversationId, userId });
    });

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

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

module.exports = { socketSetup, getIO };
