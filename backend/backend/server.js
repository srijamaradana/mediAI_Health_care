require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server, process.env.CLIENT_URL || "http://localhost:5173");

  server.listen(PORT, () => {
    console.log(`MediAI API server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  });

  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
    server.close(() => process.exit(1));
  });
};

startServer();
