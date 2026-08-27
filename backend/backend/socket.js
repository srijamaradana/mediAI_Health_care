const jwt = require("jsonwebtoken");

let io;
// Maps userId -> Set of connected socket ids (a user can have multiple tabs/devices)
const onlineUsers = new Map();

const initSocket = (server, corsOrigin) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true },
  });

  // Authenticate every socket connection using the JWT access token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token missing"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      socket.role = decoded.role;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Join a personal room so we can target this user directly
    socket.join(`user:${userId}`);
    io.emit("presence:update", { userId, online: true });

    socket.on("typing", ({ toUserId }) => {
      io.to(`user:${toUserId}`).emit("typing", { fromUserId: userId });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit("presence:update", { userId, online: false });
        }
      }
    });
  });

  return io;
};

// Emit a real-time notification to a specific user (also persisted to DB by the caller)
const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

module.exports = { initSocket, emitToUser, getIO, onlineUsers };
