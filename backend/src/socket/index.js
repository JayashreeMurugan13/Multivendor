let io;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
  });

  io.on('connection', (socket) => {
    socket.on('join', ({ userId, role }) => {
      socket.join(`${role}_${userId}`);
    });

    socket.on('admin_join', () => {
      socket.join('admins');
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };
