/**
 * Phase G1.1 — Attendance Offline Sync Engine
 *
 * Client-side engine managing local persistence, network detection,
 * batch synchronization, retry mechanisms, and state notifications.
 */

import { attendanceStore, AttendanceOfflineStore } from './offlineStore';
import {
  AttendanceOperationItem,
  AttendanceStatus,
  SyncState,
} from './types';
import { recordAttendanceBatchAction } from '@/app/actions/attendanceActions';

export interface SyncEngineStatus {
  isOnline: boolean;
  pendingCount: number;
  syncState: SyncState;
  lastSyncedAt?: Date;
  lastError?: string;
}

type SyncListener = (status: SyncEngineStatus) => void;

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export class AttendanceSyncEngine {
  private store: AttendanceOfflineStore;
  private isSyncing = false;
  private isOnline = true;
  private currentSyncState: SyncState = 'synced';
  private lastSyncedAt?: Date;
  private lastError?: string;
  private listeners = new Set<SyncListener>();
  private networkCheckInterval?: number;

  constructor(customStore?: AttendanceOfflineStore) {
    this.store = customStore || attendanceStore;

    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;

      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Periodic actual connectivity validation ping
      this.networkCheckInterval = window.setInterval(() => this.verifyRealConnectivity(), 30000);
      this.initQueueCheck();
    }
  }

  public destroy() {
    if (typeof window !== 'undefined' && this.networkCheckInterval) {
      window.clearInterval(this.networkCheckInterval);
    }
  }

  private async initQueueCheck() {
    try {
      const pending = await this.store.getPending();
      if (pending.length > 0) {
        this.currentSyncState = 'saved_locally';
        this.notifyListeners();
        if (this.isOnline) {
          this.triggerSync();
        }
      }
    } catch (err) {
      console.warn('[AttendanceSyncEngine] Queue init check warning:', err);
    }
  }

  private async handleNetworkChange(onlineState: boolean) {
    this.isOnline = onlineState;
    if (onlineState) {
      const actualConnected = await this.verifyRealConnectivity();
      if (actualConnected) {
        this.triggerSync();
      }
    } else {
      this.currentSyncState = 'saved_locally';
      this.notifyListeners();
    }
  }

  public async verifyRealConnectivity(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (!navigator.onLine) {
      this.isOnline = false;
      this.notifyListeners();
      return false;
    }

    try {
      const response = await fetch('/api/teacher/csv-import', { method: 'HEAD', cache: 'no-store' }).catch(() => null);
      const ok = response ? response.ok || response.status < 500 : true; // Fallback assume online if server route exists
      this.isOnline = ok;
      this.notifyListeners();
      return ok;
    } catch {
      this.isOnline = true; // Assume online if standard fetch is allowed
      return true;
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.notifyListeners();
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async notifyListeners() {
    let pendingCount = 0;
    try {
      const pending = await this.store.getPending();
      pendingCount = pending.length;
    } catch {
      pendingCount = 0;
    }

    const status: SyncEngineStatus = {
      isOnline: this.isOnline,
      pendingCount,
      syncState: pendingCount === 0 && !this.lastError ? 'synced' : this.currentSyncState,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError,
    };

    this.listeners.forEach((l) => l(status));
  }

  /**
   * Enqueues attendance operation locally and attempts sync.
   */
  public async markAttendance(
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string,
    studentName?: string
  ): Promise<AttendanceOperationItem> {
    const item: AttendanceOperationItem = {
      operationId: generateUUID(),
      studentId,
      studentName,
      date,
      requestedStatus: status,
      notes,
      createdAt: new Date().toISOString(),
      syncState: 'saved_locally',
      retryCount: 0,
    };

    await this.store.enqueue(item);
    this.currentSyncState = 'saved_locally';
    this.notifyListeners();

    if (this.isOnline && !this.isSyncing) {
      this.triggerSync();
    }

    return item;
  }

  /**
   * Enqueues batch of attendance operations.
   */
  public async markAttendanceBatch(
    items: Array<{ studentId: string; date: string; status: AttendanceStatus; notes?: string; studentName?: string }>
  ): Promise<AttendanceOperationItem[]> {
    const nowIso = new Date().toISOString();
    const operationItems: AttendanceOperationItem[] = items.map((i) => ({
      operationId: generateUUID(),
      studentId: i.studentId,
      studentName: i.studentName,
      date: i.date,
      requestedStatus: i.status,
      notes: i.notes,
      createdAt: nowIso,
      syncState: 'saved_locally',
      retryCount: 0,
    }));

    await this.store.enqueueBatch(operationItems);
    this.currentSyncState = 'saved_locally';
    this.notifyListeners();

    if (this.isOnline && !this.isSyncing) {
      this.triggerSync();
    }

    return operationItems;
  }

  /**
   * Main synchronization process loop.
   */
  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;

    try {
      const pending = await this.store.getPending();
      if (pending.length === 0) {
        this.currentSyncState = 'synced';
        this.lastError = undefined;
        this.notifyListeners();
        return;
      }

      this.isSyncing = true;
      this.currentSyncState = 'syncing';
      this.notifyListeners();

      const payload = {
        operations: pending.map((op) => ({
          operationId: op.operationId,
          studentId: op.studentId,
          date: op.date,
          status: op.requestedStatus,
          notes: op.notes,
          createdAt: op.createdAt,
        })),
      };

      const response = await recordAttendanceBatchAction(payload);

      if (response.success && Array.isArray(response.results)) {
        for (const res of response.results) {
          if (res.status === 'applied' || res.status === 'duplicate') {
            await this.store.remove(res.operationId);
          } else if (res.status === 'conflict') {
            // Stale update: remove local operation as server state won conflict
            await this.store.remove(res.operationId);
            this.currentSyncState = 'conflict';
          } else if (res.status === 'validation_failed' || res.status === 'authorization_failed') {
            const item = await this.store.getByOperationId(res.operationId);
            if (item) {
              item.syncState = 'sync_failed';
              item.errorMessage = res.error || 'Validation error';
              item.retryCount += 1;
              await this.store.update(item);
            }
            this.lastError = res.error || 'Attendance validation error';
          }
        }

        const remaining = await this.store.getPending();
        if (remaining.length === 0) {
          this.currentSyncState = 'synced';
          this.lastSyncedAt = new Date();
          this.lastError = undefined;
        } else {
          this.currentSyncState = 'sync_failed';
        }
      } else {
        // Network or server-level failure
        this.currentSyncState = 'sync_failed';
        this.lastError = response.error || 'Sync request failed';
        for (const op of pending) {
          op.retryCount += 1;
          op.syncState = 'sync_failed';
          op.errorMessage = response.error;
          await this.store.update(op);
        }
      }
    } catch (err: any) {
      console.error('[AttendanceSyncEngine] Sync error:', err);
      this.currentSyncState = 'sync_failed';
      this.lastError = err.message || 'Network sync error';
      try {
        const pendingOps = await this.store.getPending();
        for (const op of pendingOps) {
          op.retryCount += 1;
          op.syncState = 'sync_failed';
          op.errorMessage = err.message || 'Network error';
          await this.store.update(op);
        }
      } catch {
        // Ignore store error inside exception handler
      }
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }
}


// Singleton sync engine instance
export const syncEngine = new AttendanceSyncEngine();
