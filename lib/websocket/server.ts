import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { RealTimeEvent, WebSocketConnection } from './types';

let io: SocketIOServer | null = null;
const connections = new Map<string, WebSocketConnection>();

export const initializeWebSocket = (httpServer: HTTPServer) => {
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

    socket.on('authenticate', (data: { userId: string; role: string }) => {
      const connection: WebSocketConnection = {
        userId: data.userId,
        role: data.role,
        socketId: socket.id,
        connectedAt: Date.now(),
      };
      connections.set(socket.id, connection);

      // Join role-specific room
      socket.join(`role:${data.role}`);

      // Join user-specific room
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

    // Handle real-time events
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
        data.targetRoles.forEach((role: string) => {
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

export const getIO = () => io;

export const broadcastToRole = (role: string, event: string, data: any) => {
  io?.to(`role:${role}`).emit(event, data);
};

export const broadcastToUser = (userId: string, event: string, data: any) => {
  io?.to(`user:${userId}`).emit(event, data);
};

export const broadcastToAll = (event: string, data: any) => {
  io?.emit(event, data);
};

export const getActiveConnections = () => {
  return Array.from(connections.values());
};
