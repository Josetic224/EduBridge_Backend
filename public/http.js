const { createServer } = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const socketHandler = require("../sockets/socketHandler"); // adjust path if needed

require("dotenv").config();

const PORT = process.env.PORT || 7001;
const server = createServer(app);

// Create Socket.IO instance and attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Change to your frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Call your socket handler to handle events
socketHandler(io);

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle server errors
server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  }
});
