'use client';

import { useEffect } from 'react';
import { subscribePortalEvents, type CrossPortalEventPayload } from '@/lib/realtime/portalSync';

export function usePortalSync(
  channelName: string | null,
  onEvent: (payload: CrossPortalEventPayload) => void,
  onReconnect?: () => void
) {
  useEffect(() => {
    if (!channelName) return;

    const unsubscribe = subscribePortalEvents(channelName, onEvent, onReconnect);

    // Also handle window focus / online reconnect reconciliation
    const handleFocus = () => {
      if (onReconnect) onReconnect();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleFocus);
    };
  }, [channelName, onEvent, onReconnect]);
}
