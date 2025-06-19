const io = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ Client connected to backend server! Socket ID:", socket.id);
});

socket.on("connected", (data) => {
  console.log("📨 Received from backend server:", data);
});

socket.on("disconnect", () => {
  console.log("❌ Client disconnected");
});
