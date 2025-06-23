const socketIo = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/adda/message");
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

    //send message
    socket.on("send_message", async ({ receiverId, message, fileType }) => {
      try {
        console.log("message received :", message);
        let conversation = await Conversations.findOne({
          members: { $all: [socket.userId.toString(), receiverId] },
        });

        if (!conversation) {
          conversation = await Conversations.create({
            members: [socket.userId.toString(), receiverId],
            lastMessage: message,
          });
        } else {
          conversation.lastMessage = message;
          await conversation.save();
        }

        const chat = await Chat.create({
          conversationId: conversation._id,
          senderId: socket.userId,
          receiverId,
          message,
<<<<<<< HEAD
          fileType,
          isDelivered: false, // new fields
=======
          fileType, // new fields
          isDelivered:true
>>>>>>> upstream/main
          // fileName, // new fields
        });

        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketIds.length > 0) {
          receiver.socketIds.forEach((id) => {
            io.to(id).emit("receive_message", {
              chatId: chat._id,
              conversationId: conversation._id,
              senderId: socket.userId,
              receiverId,
              message,
              timestamp: chat.createdAt,
              fileType,
              // fileName,
            });
          });

          chat.isDelivered = true;

          await chat.save();
        } else {
          console.log("Receiver offline, message saved.");
        }

        socket.emit("receive_message", {
          chatId: chat._id,
          conversationId: conversation._id,
          senderId: socket.userId,
          receiverId,
          message,
          timestamp: chat.createdAt,
          fileType,
          // fileName,
        });
      } catch (err) {
        console.error("Error sending message:", err);
      }
    });

    //typing
    socket.on("typing", async ({ receiverId }) => {
      console.log("user is typing");
      const receiver = await User.findById(receiverId);

      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("typing", {
            userId: socket.userId,
          });
        });
      }
    });

    socket.on("stopped_typing", async ({ receiverId }) => {
      console.log("user stopped typing");
      const receiver = await User.findById(receiverId);

      if (receiver && receiver.socketIds.length > 0) {
        receiver.socketIds.forEach((socketId) => {
          io.to(socketId).emit("stopped_typing", {
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
        $set: { socketIds: [] },
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
