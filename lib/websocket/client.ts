import { io, Socket } from 'socket.io-client';
import { RealTimeEvent, BusLocationUpdate, GateScanEvent, NotificationEvent } from './types';

class WebSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(userId: string, role: string) {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000';

    this.socket = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.socket?.emit('authenticate', { userId, role });
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onBusLocationUpdate(callback: (data: BusLocationUpdate) => void) {
    this.socket?.on('bus_location_update', callback);
  }

  onGateScan(callback: (data: GateScanEvent) => void) {
    this.socket?.on('gate_scan', callback);
  }

  onNotification(callback: (data: NotificationEvent) => void) {
    this.socket?.on('notification', callback);
  }

  onAttendanceUpdate(callback: (data: any) => void) {
    this.socket?.on('attendance_update', callback);
  }

  onEmergencyAlert(callback: (data: any) => void) {
    this.socket?.on('emergency_alert', callback);
  }

  onSchoolGPTResponse(callback: (data: any) => void) {
    this.socket?.on('schoolgpt_response', callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsClient = new WebSocketClient();
