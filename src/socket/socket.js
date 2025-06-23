const socketIo = require("socket.io");
const User = require("../models/user");
const Chat = require("../models/adda/message");
const { clerk } = require("../middlewares/auth.middleware");
const Conversations = require("../models/adda/conversation");
const { Conversation } = require("twilio/lib/twiml/VoiceResponse");

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

    broadCastOnlineUsers(socket);

    notifyFollowersAboutOnlineStatus(socket.userId);

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
          fileType, // new fields
          isDelivered: true,
          isRead: false, // fileName, // new fields
        });

        const receiver = await User.findById(receiverId);
        if (receiver && receiver.socketIds.length > 0) {
          chat.isRead = true;
          await chat.save();
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

    // //mark as Read
    // socket.on("mark_as_read", async ({ conversationId }) => {
    //   const userId = socket.userId;
    //   await Chat.updateMany(
    //     { conversationId, receiverId: userId, isRead: { $ne: true } },
    //     { $set: { isRead: true } }
    //   );

    //   io.emit("messages_read", { conversationId, userId });
    // });

    //online users
    socket.on("online_users", async () => {
      console.log(
        "reached online users======================================================>"
      );
      try {
        const currentUser = await User.findById(socket.userId).select(
          "followers"
        );
        if (!currentUser) {
          return socket.emit("online_users", []);
        }

        const onlineFollowers = await User.find({
          _id: { $in: currentUser.followers },
          socketIds: { $exists: true, $ne: [] },
        }).select("_id name picture email bio");

        const result = [];

        for (const follower of onlineFollowers) {
          const conversation = await Conversations.findOne({
            members: {
              $all: [socket.userId.toString(), follower._id.toString()],
            },
          }).sort({ updatedAt: -1 });

          if (conversation) {
            result.push({
              conversation_id: conversation._id,
              friend: {
                _id: follower._id,
                name: follower.name,
                picture: follower.picture,
                email: follower.email,
                bio: follower.bio,
                isOnline: true,
              },
              lastMessage: conversation.lastMessage || "",
              updatedAt: conversation.updatedAt,
              createdAt: conversation.createdAt,
              isRead: false,
            });
          } else {
            result.push({
              _id: follower._id,
              name: follower.name,
              picture: follower.picture,
              email: follower.email,
              bio: follower.bio,
              isOnline: true,
            });
          }
        }
        console.log("result getting");

        socket.emit("online_users", result);
      } catch (error) {
        console.error("Error fetching online followers:", error);
        socket.emit("online_users", []);
      }
    });

    //disconnect
    socket.on("disconnect", async () => {
      console.log("a user disconnected");
      const user = await User.findByIdAndUpdate(socket.userId, {
        $pull: { socketIds: socket.id },
      });

      console.log("disconnected user :", user.email);

      broadCastOnlineUsers(socket);
      await notifyFollowersAboutOnlineStatus(socket.userId);
    });
  });

  return io;
};

//passing online users
const broadCastOnlineUsers = async (socket) => {
  try {
    console.log(`[broadCastOnlineUsers] Started for userId: ${socket.userId}`);

    const currentUser = await User.findById(socket.userId).select("followers");
    if (!currentUser) {
      console.warn(
        `[broadCastOnlineUsers] User not found for userId: ${socket.userId}`
      );
      return socket.emit("online_users", []);
    }

    console.log(
      `[broadCastOnlineUsers] Found user. Total followers: ${currentUser.followers.length}`
    );

    const onlineFollowers = await User.find({
      _id: { $in: currentUser.followers },
      socketIds: { $exists: true, $ne: [] },
    }).select("_id name picture email bio");

    console.log(
      `[broadCastOnlineUsers] Found ${onlineFollowers.length} online followers`
    );

    const result = [];

    for (const follower of onlineFollowers) {
      console.log(
        `[broadCastOnlineUsers] Processing follower: ${follower._id}`
      );

      const conversation = await Conversations.findOne({
        members: {
          $all: [socket.userId.toString(), follower._id.toString()],
        },
      }).sort({ updatedAt: -1 });

      if (conversation) {
        console.log(
          `[broadCastOnlineUsers] Found conversation with follower: ${follower._id}, conversationId: ${conversation._id}, user name : ${follower.email}`
        );

        result.push({
          conversation_id: conversation._id,
          friend: {
            _id: follower._id,
            name: follower.name,
            picture: follower.picture,
            email: follower.email,
            bio: follower.bio,
            isOnline: true,
          },
          lastMessage: conversation.lastMessage || "",
          updatedAt: conversation.updatedAt,
          createdAt: conversation.createdAt,
          isRead: false,
        });
      } else {
        console.log(
          `[broadCastOnlineUsers] No conversation found with follower: ${follower._id}`
        );

        console.log("online friend found", follower.email);

        result.push({
          _id: follower._id,
          name: follower.name,
          picture: follower.picture,
          email: follower.email,
          bio: follower.bio,
          isOnline: true,
        });
      }
    }

    console.log(
      `[broadCastOnlineUsers] Final result prepared: ${result.length} entries`
    );

    console.log("result ");
    socket.emit("online_users", result);
  } catch (error) {
    console.error(
      "[broadCastOnlineUsers] Error fetching online followers:",
      error
    );
    socket.emit("online_users", []);
  }
};

//notify
const notifyFollowersAboutOnlineStatus = async (userId) => {
  const currentUser = await User.findById(userId).select("followers");

  if (!currentUser) return;

  for (const followerId of currentUser.followers) {
    const follower = await User.findById(followerId);
    if (!follower || !follower.socketIds.length) continue;

    follower.socketIds.forEach((socketId) => {
      io.to(socketId).emit("refresh_online_users");
    });
  }
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }

  return io;
};

module.exports = { socketSetup, getIO };
