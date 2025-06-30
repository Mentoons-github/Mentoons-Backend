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

    socket.emit("mongo_user_id", { userId: socket.userId });
    
    // Broadcast online status after connection
    await updateUserOnlineStatus(socket.userId, socket.id, true);
    await broadCastOnlineUsersToAll();


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
              const receiverIdStr = receiver.toString();
              console.log(receiverIdStr, "receiveeeerrrrr");
              const currentCount =
                conversation.unreadCounts.get(receiverIdStr) || 0;
              conversation.unreadCounts.set(receiverIdStr, currentCount + 1);
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
        conversation.unreadCounts.set(userId.toString(), 0);
        await conversation.save();

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

    socket.on("disconnect", async (reason) => {
      console.log(`User disconnected: ${socket.id}, userId: ${socket.userId}, reason: ${reason}`);
      
      try {
        await updateUserOnlineStatus(socket.userId, socket.id, false);
        setTimeout(async () => {
          await broadCastOnlineUsersToAll();
        }, 100);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    socket.on("disconnecting", async (reason) => {
      console.log(`User disconnecting: ${socket.id}, userId: ${socket.userId}, reason: ${reason}`);
      
      try {
        await updateUserOnlineStatus(socket.userId, socket.id, false);
      } catch (error) {
        console.error("Error handling disconnecting:", error);
      }
    });
  });

  return io;
};

const updateUserOnlineStatus = async (userId, socketId, isConnecting) => {
  try {
    if (isConnecting) {
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { socketIds: socketId } },
        { new: true }
      );
      console.log(`Added socket ${socketId} for user ${userId}`);
    } else {
      const user = await User.findById(userId);
      if (user) {
        const updatedSocketIds = user.socketIds.filter(id => id !== socketId);
        
        await User.findByIdAndUpdate(
          userId,
          { $set: { socketIds: updatedSocketIds } },
          { new: true }
        );
        
        console.log(`Removed socket ${socketId} for user ${userId}. Remaining sockets: ${updatedSocketIds.length}`);
      }
    }
  } catch (error) {
    console.error("Error updating user online status:", error);
  }
};

// Clean up stale socket connections (run periodically)
const cleanupStaleConnections = async () => {
  try {
    const users = await User.find({ socketIds: { $exists: true, $ne: [] } });
    
    for (const user of users) {
      const activeSocketIds = [];
      
      for (const socketId of user.socketIds) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket && socket.connected) {
          activeSocketIds.push(socketId);
        }
      }
      
      if (activeSocketIds.length !== user.socketIds.length) {
        await User.findByIdAndUpdate(
          user._id,
          { $set: { socketIds: activeSocketIds } },
          { new: true }
        );
        console.log(`Cleaned up stale connections for user ${user._id}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up stale connections:", error);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupStaleConnections, 5 * 60 * 1000);

const broadCastOnlineUsersToAll = async () => {
  try {
    await cleanupStaleConnections();
    
    const onlineUsers = await User.find({
      socketIds: { $exists: true, $ne: [] }
    }).select("_id socketIds");

    console.log(`Broadcasting online users to all: ${onlineUsers.length} users online`);

    const connectedSockets = await io.fetchSockets();
    
    for (const socket of connectedSockets) {
      if (socket.userId) {
        await broadCastOnlineUsersToSpecificUser(socket.id, socket.userId);
      }
    }
  } catch (error) {
    console.error("Error broadcasting online users to all:", error);
  }
};

const broadCastOnlineUsersToSpecificUser = async (socketId, userId) => {
  try {
    const currentUser = await User.findById(userId);
    if (!currentUser) return;

    const onlineUsers = await User.find({
      _id: { $in: currentUser.following },
      socketIds: { $exists: true, $ne: [] },
    }).select("_id");

    io.to(socketId).emit("online_users", onlineUsers);
  } catch (error) {
    console.error("Error broadcasting to specific user:", error);
  }
};

const broadCastOnlineUsers = async (socket) => {
  await broadCastOnlineUsersToSpecificUser(socket.id, socket.userId);
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { socketSetup, getIO };