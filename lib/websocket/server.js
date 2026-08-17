const { Server: SocketIOServer } = require('socket.io');

let io = null;
const connections = new Map();

const initializeWebSocket = (httpServer) => {
  if (io) return io;

  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);

    socket.on('authenticate', (data) => {
      const connection = {
        userId: data.userId,
        role: data.role,
        socketId: socket.id,
        connectedAt: Date.now(),
      };
      connections.set(socket.id, connection);

      socket.join(`role:${data.role}`);
      socket.join(`user:${data.userId}`);
      console.log(`User ${data.userId} (${data.role}) authenticated`);
    });

    socket.on('disconnect', () => {
      const connection = connections.get(socket.id);
      if (connection) {
        console.log(`User ${connection.userId} disconnected`);
        connections.delete(socket.id);
      }
    });

    socket.on('bus_location_update', (data) => {
      io?.to('role:parent').emit('bus_location_update', data);
      io?.to('role:admin').emit('bus_location_update', data);
    });

    socket.on('gate_scan', (data) => {
      io?.to('role:parent').emit('gate_scan', data);
      io?.to('role:teacher').emit('gate_scan', data);
      io?.to('role:admin').emit('gate_scan', data);
    });

    socket.on('notification', (data) => {
      if (data.targetRoles) {
        data.targetRoles.forEach((role) => {
          io?.to(`role:${role}`).emit('notification', data);
        });
      } else {
        io?.emit('notification', data);
      }
    });

    socket.on('attendance_update', (data) => {
      io?.to('role:teacher').emit('attendance_update', data);
      io?.to('role:admin').emit('attendance_update', data);
    });

    socket.on('emergency_alert', (data) => {
      io?.emit('emergency_alert', data);
    });
  });

  return io;
};

const getIO = () => io;

const broadcastToRole = (role, event, data) => {
  io?.to(`role:${role}`).emit(event, data);
};

const broadcastToUser = (userId, event, data) => {
  io?.to(`user:${userId}`).emit(event, data);
};

const broadcastToAll = (event, data) => {
  io?.emit(event, data);
};

const getActiveConnections = () => {
  return Array.from(connections.values());
};

module.exports = {
  initializeWebSocket,
  getIO,
  broadcastToRole,
  broadcastToUser,
  broadcastToAll,
  getActiveConnections,
};
