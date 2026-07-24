import type { ScanMode, ScanResult, DeviceMetadata } from './types';

export interface ScanEventPayload {
  eventId: string;
  cardId: string;
  studentId: string;
  studentName: string;
  mode: ScanMode;
  result: Extract<ScanResult, 'success'>;
  scannerPortal: string;
  scannerIdentity: string;
  deviceMetadata: DeviceMetadata;
  scannedAt: Date;
  metadata: Record<string, unknown>;
}

export interface ScanRejectedPayload {
  eventId: string;
  cardId: string | null;
  studentId: string | null;
  mode: ScanMode;
  result: Exclude<ScanResult, 'success'>;
  scannerPortal: string;
  scannerIdentity: string;
  errorDetail: string;
  scannedAt: Date;
}

export type ScanEvent = { type: 'scan.validated'; payload: ScanEventPayload }
  | { type: 'scan.rejected'; payload: ScanRejectedPayload }
  | { type: `scan:${ScanMode}`; payload: ScanEventPayload };

type ScanHandler = (event: ScanEvent) => void | Promise<void>;

class InternalEventBus {
  private handlers = new Map<string, ScanHandler[]>();
  private static instance: InternalEventBus;

  static getInstance(): InternalEventBus {
    if (!InternalEventBus.instance) {
      InternalEventBus.instance = new InternalEventBus();
    }
    return InternalEventBus.instance;
  }

  on(eventType: string, handler: ScanHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  off(eventType: string, handler: ScanHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(
      eventType,
      existing.filter((h) => h !== handler),
    );
  }

  async emit(event: ScanEvent): Promise<void> {
    const typeHandlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    const allHandlers = [...typeHandlers, ...wildcardHandlers];
    if (allHandlers.length === 0) return;

    const results = await Promise.allSettled(
      allHandlers.map((handler) => handler(event)),
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`[EventBus] Handler failed for ${event.type}:`, result.reason);
      }
    }
  }
}

export const eventBus = InternalEventBus.getInstance();

export function registerDefaultHandlers(): void {
  // Mode-specific handlers are registered by the scan handler module.
  // This function is a hook for future dynamic registration.
}
