export type RealTimeEventType =
  | 'bus_location_update'
  | 'gate_scan'
  | 'notification'
  | 'attendance_update'
  | 'message_received'
  | 'schoolgpt_response'
  | 'student_status_change'
  | 'emergency_alert';

export interface RealTimeEvent {
  type: RealTimeEventType;
  data: any;
  timestamp: number;
  userId?: string;
  role?: string;
}

export interface WebSocketConnection {
  userId: string;
  role: string;
  socketId: string;
  connectedAt: number;
}

export interface BusLocationUpdate {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  eta: number;
  nextStop: string;
}

export interface GateScanEvent {
  studentId: string;
  studentName: string;
  gateId: string;
  scanType: 'entry' | 'exit';
  timestamp: number;
}

export interface NotificationEvent {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high';
  targetRoles?: string[];
}
