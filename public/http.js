const { createServer } = require("http");
const app = require("./app");
const PORT = process.env.PORT || 7001;

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use.`);
  }
});
