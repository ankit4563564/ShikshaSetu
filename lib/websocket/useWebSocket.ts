'use client';

import { useEffect, useRef, useState } from 'react';
import { wsClient } from './client';
import { BusLocationUpdate, GateScanEvent, NotificationEvent } from './types';

export function useWebSocket(userId: string, role: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [busLocation, setBusLocation] = useState<BusLocationUpdate | null>(null);
  const [gateScan, setGateScan] = useState<GateScanEvent | null>(null);
  const [notification, setNotification] = useState<NotificationEvent | null>(null);

  useEffect(() => {
    const socket = wsClient.connect(userId, role);

    setIsConnected(socket.connected);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    // Bus location updates
    wsClient.onBusLocationUpdate((data) => {
      setBusLocation(data);
    });

    // Gate scans
    wsClient.onGateScan((data) => {
      setGateScan(data);
    });

    // Notifications
    wsClient.onNotification((data) => {
      setNotification(data);
    });

    return () => {
      wsClient.off('bus_location_update');
      wsClient.off('gate_scan');
      wsClient.off('notification');
      wsClient.disconnect();
    };
  }, [userId, role]);

  return {
    isConnected,
    busLocation,
    gateScan,
    notification,
    emit: wsClient.emit.bind(wsClient),
  };
}

export function useBusTracking(userId: string, role: string) {
  const [busLocation, setBusLocation] = useState<BusLocationUpdate | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (role !== 'parent' && role !== 'admin') return;

    const socket = wsClient.connect(userId, role);

    wsClient.onBusLocationUpdate((data) => {
      setBusLocation(data);
      setIsTracking(true);
    });

    return () => {
      wsClient.off('bus_location_update');
    };
  }, [userId, role]);

  return { busLocation, isTracking };
}

export function useGateNotifications(userId: string, role: string) {
  const [gateScans, setGateScans] = useState<GateScanEvent[]>([]);

  useEffect(() => {
    if (role !== 'parent' && role !== 'teacher' && role !== 'admin') return;

    const socket = wsClient.connect(userId, role);

    wsClient.onGateScan((data) => {
      setGateScans((prev) => [data, ...prev].slice(0, 50)); // Keep last 50 scans
    });

    return () => {
      wsClient.off('gate_scan');
    };
  }, [userId, role]);

  return { gateScans };
}

export function useRealTimeNotifications(userId: string, role: string) {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    const socket = wsClient.connect(userId, role);

    wsClient.onNotification((data) => {
      setNotifications((prev) => [data, ...prev].slice(0, 100)); // Keep last 100
    });

    return () => {
      wsClient.off('notification');
    };
  }, [userId, role]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, markAsRead };
}
