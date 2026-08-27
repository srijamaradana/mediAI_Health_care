const jwt = require('jsonwebtoken');

// Maps userId -> Set of connected socket ids, so a user open in
// multiple tabs/devices still gets every real-time event.
const onlineUsers = new Map();

let ioInstance;

const initSocket = (io) => {
  ioInstance = io;

  // Authenticate every socket connection using the same JWT access token
  // the REST API uses, passed via the client as `auth: { token }`.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId } = socket;

    // Every user joins a private room named after their own id, so
    // controllers can emit to `userId` without tracking socket ids.
    socket.join(userId);

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('presence:update', { userId, online: true });

    socket.on('typing', ({ toUserId }) => {
      io.to(toUserId).emit('typing', { fromUserId: userId });
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('presence:update', { userId, online: false });
        }
      }
    });
  });
};

/** Emit a real-time event to a single user's private room. */
const emitToUser = (userId, event, payload) => {
  if (!ioInstance) return;
  ioInstance.to(userId.toString()).emit(event, payload);
};

const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { initSocket, emitToUser, isUserOnline };
