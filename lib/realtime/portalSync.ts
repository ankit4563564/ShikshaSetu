import { createClient } from '@/lib/supabase/client';

export type CrossPortalEventType =
  | 'ATTENDANCE_MUTATED'
  | 'HOMEWORK_MUTATED'
  | 'HOMEWORK_SUBMITTED'
  | 'GRADES_PUBLISHED'
  | 'GATE_PASS_MUTATED'
  | 'INTERVENTION_MUTATED'
  | 'TRIP_MUTATED'
  | 'CALENDAR_MUTATED';

export interface CrossPortalEventPayload {
  eventType: CrossPortalEventType;
  studentId?: string;
  tenantId?: string;
  actorId?: string;
  actorRole?: string;
  timestamp: string;
  data?: Record<string, any>;
}

/**
 * Broadcasts a real-time cross-portal event to an authorized channel.
 */
export async function broadcastPortalEvent(
  channelName: string,
  eventType: CrossPortalEventType,
  payload: Omit<CrossPortalEventPayload, 'eventType' | 'timestamp'>
) {
  try {
    const supabase = createClient();
    const fullPayload: CrossPortalEventPayload = {
      ...payload,
      eventType,
      timestamp: new Date().toISOString(),
    };

    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: eventType,
      payload: fullPayload,
    });
  } catch (error) {
    console.error(`[PortalSync] Failed to broadcast event ${eventType} to ${channelName}:`, error);
  }
}

/**
 * Subscribes to a scoped portal real-time channel with auto-reconnect reconciliation.
 */
export function subscribePortalEvents(
  channelName: string,
  onEvent: (payload: CrossPortalEventPayload) => void,
  onReconnect?: () => void
) {
  const supabase = createClient();

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: true },
    },
  });

  const eventTypes: CrossPortalEventType[] = [
    'ATTENDANCE_MUTATED',
    'HOMEWORK_MUTATED',
    'HOMEWORK_SUBMITTED',
    'GRADES_PUBLISHED',
    'GATE_PASS_MUTATED',
    'INTERVENTION_MUTATED',
    'TRIP_MUTATED',
    'CALENDAR_MUTATED',
  ];

  eventTypes.forEach((evt) => {
    channel.on('broadcast', { event: evt }, (response) => {
      if (response && response.payload) {
        onEvent(response.payload as CrossPortalEventPayload);
      }
    });
  });

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      if (onReconnect) onReconnect();
    }
  });

  return () => {
    supabase.removeChannel(channel);
  };
}
