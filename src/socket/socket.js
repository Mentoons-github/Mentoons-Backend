const socketIo = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/adda/message");
const { clerk } = require("../middlewares/auth.middleware");
const Conversations = require("../models/adda/conversation");

let io;

const socketSetup = (server) => {
  console.log("Socket connecting...");
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

  // Auth middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    console.log("Entering auth middleware");
    if (!token) return next(new Error("Authentication token missing"));

    try {
      const session = await clerk.verifyToken(token);
      const clerkId = session.sub;

      const user = await User.findOneAndUpdate(
        { clerkId },
        { $addToSet: { socketIds: socket.id } },
        { new: true }
      );

      if (!user) return next(new Error("User not found in DB"));
      socket.userId = user._id;
      next();
    } catch (err) {
      console.error("Socket token verification error:", err);
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`Socket connected: ${socket.id}, user: ${socket.userId}`);
    broadCastOnlineUsers(socket);

    const undeliveredMessages = await Chat.find({
      receiverId: socket.userId,
      isDelivered: false,
    });

    const unreadMessage = await Chat.countDocuments({
      receiverId: socket.userId,
      isRead: false,
    });

    io.to(socket.id).emit("unread_message_count", {
      count: unreadMessage,
    });

    if (undeliveredMessages.length > 0) {
      await Chat.updateMany(
        { receiverId: socket.userId, isDelivered: false },
        { $set: { isDelivered: true } }
      );
    }

    // Send message
    socket.on(
      "send_message",
      async ({ receiverId, message, fileType, isForwarded = false }) => {
        try {
          console.log("Message received:", message);
          const receiverIds = Array.isArray(receiverId)
            ? receiverId
            : [receiverId];

          for (const receiver of receiverIds) {
            let conversation = await Conversations.findOne({
              members: { $all: [socket.userId.toString(), receiver] },
            });

            if (!conversation) {
              conversation = await Conversations.create({
                members: [socket.userId.toString(), receiver],
                lastMessage: message,
                messageType: fileType,
              });
            } else {
              conversation.lastMessage = message;
              conversation.messageType = fileType;
              await conversation.save();
            }

            let isDelivered = false;
            const receiverUser = await User.findById(receiver);
            if (receiverUser && receiverUser.socketIds.length > 0) {
              isDelivered = true;
            }

            const chat = await Chat.create({
              conversationId: conversation._id,
              senderId: socket.userId,
              receiverId: receiver,
              message,
              fileType,
              isDelivered,
              isRead: false,
              isForwarded,
            });

            const unreadCount = await Chat.countDocuments({
              receiverId: receiver,
              isRead: false,
            });

            // Emit to receiver if online
            if (isDelivered) {
              receiverUser.socketIds.forEach((id) => {
                io.to(id).emit("unread_message_count", {
                  count: unreadCount,
                });
                io.to(id).emit("receive_message", {
                  chatId: chat._id,
                  conversationId: conversation._id,
                  senderId: socket.userId,
                  receiverId: receiver,
                  message,
                  createdAt: chat.createdAt,
                  fileType,
                  isDelivered,
                  isRead: false,
                  isForwarded,
                });
              });
            } else {
              console.log("Receiver offline, message saved.");
            }

            // Emit back to sender also
            socket.emit("receive_message", {
              chatId: chat._id,
              conversationId: conversation._id,
              senderId: socket.userId,
              receiverId: receiver,
              message,
              createdAt: chat.createdAt,
              fileType,
              isDelivered,
              isRead: false,
              isForwarded,
            });
          }
        } catch (err) {
          console.error("Error sending message:", err);
        }
      }
    );

    // Typing indicators
    socket.on("typing", async ({ receiverId }) => {
      const receiver = await User.findById(receiverId);
      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("typing", { userId: socket.userId });
        });
      }
    });

    socket.on("stopped_typing", async ({ receiverId }) => {
      const receiver = await User.findById(receiverId);
      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("stopped_typing", { userId: socket.userId });
        });
      }
    });

    // Mark as Read
    socket.on("mark_as_read", async ({ conversationId }) => {
      const userId = socket.userId;

      // Update unread messages for this user
      await Chat.updateMany(
        { conversationId, receiverId: userId, isRead: { $ne: true } },
        { $set: { isRead: true } }
      );

      const newUnreadCount = await Chat.countDocuments({
        receiverId: userId,
        isRead: false,
      });
      io.to(socket.id).emit("unread_message_count", {
        count: newUnreadCount,
      });

      // Notify sender(s) that receiver read messages
      const conversation = await Conversations.findById(conversationId);
      if (conversation) {
        const otherMemberIds = conversation.members.filter(
          (id) => id.toString() !== userId.toString()
        );

        for (const senderId of otherMemberIds) {
          const sender = await User.findById(senderId);
          if (sender && sender.socketIds.length > 0) {
            sender.socketIds.forEach((socketId) => {
              io.to(socketId).emit("messages_read", { conversationId, userId });
            });
          }
        }
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log("a user disconnected");
      await User.findByIdAndUpdate(socket.userId, {
        $set: { socketIds: [] },
      });
      broadCastOnlineUsers(socket);
    });
  });

  return io;
};

const broadCastOnlineUsers = async (socket) => {
  const currentUser = await User.findById(socket.userId);
  if (!currentUser) return;

  const onlineUsers = await User.find({
    _id: { $in: currentUser.following },
    socketIds: { $exists: true, $ne: [] },
  }).select("_id");

  io.to(socket.id).emit("online_users", onlineUsers);
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { socketSetup, getIO };
