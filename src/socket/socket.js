const socketIo = require("socket.io");

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

  io.on("connection", (socket) => {
    console.log("a device connected");

    socket.emit("connected", { message: "Socket connection successful!" });

    socket.on("disconnect", () => {
      console.log("a user disconnected");
    });
  });

  return io;
};

module.exports = socketSetup;
