/**
 * Phase G1.1 — Attendance Offline Store Interface & Implementation
 *
 * Operational attendance data persistence backed by IndexedDB.
 * Isolated behind AttendanceOfflineStore interface.
 */

import { AttendanceOperationItem, AttendanceRosterStudent } from './types';

export interface AttendanceOfflineStore {
  isIndexedDBAvailable(): boolean;
  enqueue(item: AttendanceOperationItem): Promise<void>;
  enqueueBatch(items: ReadonlyArray<AttendanceOperationItem>): Promise<void>;
  getPending(): Promise<AttendanceOperationItem[]>;
  getByOperationId(operationId: string): Promise<AttendanceOperationItem | null>;
  update(item: AttendanceOperationItem): Promise<void>;
  remove(operationId: string): Promise<void>;
  clear(): Promise<void>;
  cacheRoster(key: string, roster: ReadonlyArray<AttendanceRosterStudent>): Promise<void>;
  getCachedRoster(key: string): Promise<AttendanceRosterStudent[] | null>;
}

const DB_NAME = 'ShikshaSetu_Attendance_Offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'pending_operations';
const ROSTER_STORE = 'cached_rosters';

class IndexedDBAttendanceStore implements AttendanceOfflineStore {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public isIndexedDBAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return !!window.indexedDB;
    } catch {
      return false;
    }
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isIndexedDBAvailable()) {
      return Promise.reject(new Error('IndexedDB unavailable'));
    }

    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onblocked = () => {
          console.warn('[IndexedDB] Database upgrade blocked by another connection');
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(QUEUE_STORE)) {
            db.createObjectStore(QUEUE_STORE, { keyPath: 'operationId' });
          }
          if (!db.objectStoreNames.contains(ROSTER_STORE)) {
            db.createObjectStore(ROSTER_STORE, { keyPath: 'key' });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => {
          this.dbPromise = null;
          reject(request.error);
        };
      } catch (err) {
        this.dbPromise = null;
        reject(err);
      }
    });

    return this.dbPromise;
  }

  public async enqueue(item: AttendanceOperationItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async enqueueBatch(items: ReadonlyArray<AttendanceOperationItem>): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public async getPending(): Promise<AttendanceOperationItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async getByOperationId(operationId: string): Promise<AttendanceOperationItem | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.get(operationId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  public async update(item: AttendanceOperationItem): Promise<void> {
    return this.enqueue(item);
  }

  public async remove(operationId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.delete(operationId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(QUEUE_STORE, 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async cacheRoster(key: string, roster: ReadonlyArray<AttendanceRosterStudent>): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ROSTER_STORE, 'readwrite');
      const store = tx.objectStore(ROSTER_STORE);
      const req = store.put({ key, roster, cachedAt: new Date().toISOString() });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async getCachedRoster(key: string): Promise<AttendanceRosterStudent[] | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ROSTER_STORE, 'readonly');
      const store = tx.objectStore(ROSTER_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result && req.result.roster) {
          resolve(req.result.roster);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }
}

// In-Memory store for non-browser/testing environments
export class InMemoryAttendanceStore implements AttendanceOfflineStore {
  private queue = new Map<string, AttendanceOperationItem>();
  private rosters = new Map<string, AttendanceRosterStudent[]>();

  public isIndexedDBAvailable(): boolean {
    return true; // Virtualized for test runtime
  }

  public async enqueue(item: AttendanceOperationItem): Promise<void> {
    this.queue.set(item.operationId, { ...item });
  }

  public async enqueueBatch(items: ReadonlyArray<AttendanceOperationItem>): Promise<void> {
    items.forEach((item) => this.queue.set(item.operationId, { ...item }));
  }

  public async getPending(): Promise<AttendanceOperationItem[]> {
    return Array.from(this.queue.values());
  }

  public async getByOperationId(operationId: string): Promise<AttendanceOperationItem | null> {
    return this.queue.get(operationId) || null;
  }

  public async update(item: AttendanceOperationItem): Promise<void> {
    this.queue.set(item.operationId, { ...item });
  }

  public async remove(operationId: string): Promise<void> {
    this.queue.delete(operationId);
  }

  public async clear(): Promise<void> {
    this.queue.clear();
  }

  public async cacheRoster(key: string, roster: ReadonlyArray<AttendanceRosterStudent>): Promise<void> {
    this.rosters.set(key, [...roster]);
  }

  public async getCachedRoster(key: string): Promise<AttendanceRosterStudent[] | null> {
    return this.rosters.get(key) || null;
  }
}

// Default export uses IndexedDB when in browser, or InMemory when in tests/node
export const attendanceStore: AttendanceOfflineStore =
  typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
    ? new IndexedDBAttendanceStore()
    : new InMemoryAttendanceStore();
