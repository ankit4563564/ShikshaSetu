# WebSocket Real-Time Features

## Overview
This module provides real-time communication capabilities for ShikshaSetu using Socket.IO.

## Features
- Real-time bus location tracking
- Live gate scan notifications
- Instant notifications
- Attendance updates
- Emergency alerts
- SchoolGPT real-time responses

## Server Setup

The WebSocket server is initialized in `server.js` and runs alongside the Next.js app.

**Important:** The project now uses a custom server (`server.js`) instead of the default Next.js dev server.

### Starting the Server

```bash
npm run dev
```

This will start both the Next.js app and the WebSocket server on port 3000.

## Client Usage

### Basic Connection

```typescript
import { wsClient } from '@/lib/websocket/client';

// Connect to WebSocket
wsClient.connect(userId, role);

// Disconnect
wsClient.disconnect();
```

### React Hooks

#### useWebSocket
General WebSocket hook for all real-time events.

```typescript
import { useWebSocket } from '@/lib/websocket/useWebSocket';

function MyComponent() {
  const { isConnected, busLocation, gateScan, notification, emit } = useWebSocket(userId, role);

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  );
}
```

#### useBusTracking
Specifically for bus location tracking (parents and admins).

```typescript
import { useBusTracking } from '@/lib/websocket/useWebSocket';

function BusTracker() {
  const { busLocation, isTracking } = useBusTracking(userId, role);

  if (isTracking && busLocation) {
    return (
      <div>
        <p>Bus Location: {busLocation.latitude}, {busLocation.longitude}</p>
        <p>ETA: {busLocation.eta} minutes</p>
      </div>
    );
  }
}
```

#### useGateNotifications
For gate scan notifications (parents, teachers, admins).

```typescript
import { useGateNotifications } from '@/lib/websocket/useWebSocket';

function GateMonitor() {
  const { gateScans } = useGateNotifications(userId, role);

  return (
    <div>
      {gateScans.map((scan) => (
        <div key={scan.timestamp}>
          {scan.studentName} - {scan.scanType}
        </div>
      ))}
    </div>
  );
}
```

#### useRealTimeNotifications
For general notifications.

```typescript
import { useRealTimeNotifications } from '@/lib/websocket/useWebSocket';

function NotificationCenter() {
  const { notifications, markAsRead } = useRealTimeNotifications(userId, role);

  return (
    <div>
      {notifications.map((notif) => (
        <div key={notif.id}>
          <h3>{notif.title}</h3>
          <p>{notif.message}</p>
          <button onClick={() => markAsRead(notif.id)}>Mark as Read</button>
        </div>
      ))}
    </div>
  );
}
```

## Server-Side Broadcasting

### Broadcast to Specific Role

```typescript
import { broadcastToRole } from '@/lib/websocket/server';

// Send to all parents
broadcastToRole('parent', 'bus_location_update', {
  busId: 'bus-001',
  latitude: 28.6139,
  longitude: 77.2090,
  speed: 30,
  eta: 15,
  nextStop: 'Saket'
});
```

### Broadcast to Specific User

```typescript
import { broadcastToUser } from '@/lib/websocket/server';

// Send to specific user
broadcastToUser('user-123', 'notification', {
  id: 'notif-001',
  title: 'Homework Reminder',
  message: 'Math homework due tomorrow',
  type: 'info',
  priority: 'medium'
});
```

### Broadcast to All

```typescript
import { broadcastToAll } from '@/lib/websocket/server';

// Emergency alert to everyone
broadcastToAll('emergency_alert', {
  type: 'fire_drill',
  message: 'Fire drill in progress',
  timestamp: Date.now()
});
```

## Event Types

- `bus_location_update` - Real-time bus GPS updates
- `gate_scan` - Student entry/exit scans
- `notification` - General notifications
- `attendance_update` - Attendance status changes
- `message_received` - New messages
- `schoolgpt_response` - AI assistant responses
- `student_status_change` - Student status updates
- `emergency_alert` - Emergency broadcasts

## Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_WS_URL=http://localhost:3000
```

For production:

```env
NEXT_PUBLIC_WS_URL=https://your-domain.com
```

## Role-Based Rooms

Users automatically join rooms based on their role:
- `role:teacher` - All teachers
- `role:parent` - All parents
- `role:student` - All students
- `role:admin` - All admins
- `role:driver` - All drivers
- `role:gate` - All gate staff
- `role:vendor` - All vendors

And user-specific rooms:
- `user:{userId}` - Individual user

## Security

- Authentication required via `authenticate` event
- Role-based access control
- CORS configured for allowed origins
- Sensitive data filtering in place

## Performance

- Automatic reconnection with exponential backoff
- Connection pooling
- Room-based broadcasting for efficiency
- Max 5 reconnection attempts

## Troubleshooting

### Connection Issues
- Check that `server.js` is running (not `next dev`)
- Verify `NEXT_PUBLIC_WS_URL` is correct
- Check browser console for connection errors

### Events Not Receiving
- Verify user is authenticated
- Check role matches expected room
- Ensure event type matches listener

### Performance Issues
- Reduce reconnection delay in `client.ts`
- Implement event throttling
- Use room-based broadcasting instead of global
