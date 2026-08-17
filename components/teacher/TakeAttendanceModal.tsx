'use client';

import { useState, useEffect, useMemo } from 'react';
import { syncEngine, SyncEngineStatus } from '@/lib/attendance/offlineSyncEngine';
import { attendanceStore } from '@/lib/attendance/offlineStore';
import { AttendanceStatus, AttendanceRosterStudent } from '@/lib/attendance/types';

interface TakeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudents?: AttendanceRosterStudent[];
  className?: string;
}

export function TakeAttendanceModal({
  isOpen,
  onClose,
  initialStudents = [],
}: TakeAttendanceModalProps) {
  const [roster, setRoster] = useState<AttendanceRosterStudent[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingCount: 0,
    syncState: 'synced',
  });
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterUnavailableOffline, setRosterUnavailableOffline] = useState(false);
  const [indexedDBSupported, setIndexedDBSupported] = useState(true);
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const formattedTodayDate = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }),
    []
  );

  // Subscribe to sync engine updates
  useEffect(() => {
    setIndexedDBSupported(attendanceStore.isIndexedDBAvailable());

    const unsubscribe = syncEngine.subscribe((status) => {
      setSyncStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Load roster (from initial props, cached IndexedDB, or server)
  useEffect(() => {
    if (!isOpen) return;

    async function loadClassRoster() {
      setRosterLoading(true);
      setRosterUnavailableOffline(false);

      if (initialStudents && initialStudents.length > 0) {
        setRoster(initialStudents);
        const cacheKey = className ? `class_${className.replace(/\s/g, '_').toLowerCase()}` : 'class_default';
        await attendanceStore.cacheRoster(cacheKey, initialStudents);
        setRosterLoading(false);
        return;
      }

      // Try loading cached roster from IndexedDB
      const cacheKey = className ? `class_${className.replace(/\s/g, '_').toLowerCase()}` : 'class_default';
      const cached = await attendanceStore.getCachedRoster(cacheKey);
      if (cached && cached.length > 0) {
        setRoster(cached);
        setRosterLoading(false);
      } else if (!navigator.onLine) {
        setRosterUnavailableOffline(true);
        setRosterLoading(false);
      } else {
        // No initial students, no cache, and online but DB empty
        // Set empty roster — do not fabricate fake student IDs
        setRoster([]);
        setRosterLoading(false);
      }
    }

    loadClassRoster();
  }, [isOpen, initialStudents]);

  // Handle marking status for individual student
  const handleStatusChange = async (studentId: string, status: AttendanceStatus) => {
    const student = roster.find((s) => s.studentId === studentId);
    setRoster((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, currentStatus: status } : s))
    );

    await syncEngine.markAttendance(
      studentId,
      todayStr,
      status,
      undefined,
      student?.displayName
    );
  };

  // Mark all students present action
  const handleMarkAllPresent = async () => {
    setRoster((prev) => prev.map((s) => ({ ...s, currentStatus: 'present' })));

    const batch = roster.map((s) => ({
      studentId: s.studentId,
      date: todayStr,
      status: 'present' as AttendanceStatus,
      studentName: s.displayName,
    }));

    await syncEngine.markAttendanceBatch(batch);
  };

  const filteredRoster = useMemo(() => {
    if (!searchQuery.trim()) return roster;
    return roster.filter((s) =>
      s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.includes(searchQuery))
    );
  }, [roster, searchQuery]);

  const summary = useMemo(() => {
    const total = roster.length;
    const present = roster.filter((s) => s.currentStatus === 'present').length;
    const absent = roster.filter((s) => s.currentStatus === 'absent').length;
    const late = roster.filter((s) => s.currentStatus === 'late').length;
    const medical = roster.filter((s) => s.currentStatus === 'medical_leave').length;
    const excused = roster.filter((s) => s.currentStatus === 'excused').length;
    return { total, present, absent, late, medical, excused };
  }, [roster]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden font-body">
        
        {/* Top Header & Context Bar */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Grade 8A Roster
              </span>
              <span className="text-slate-400 text-xs">{formattedTodayDate}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight mt-1 text-white">
              Daily Attendance Roll Call
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <span>✓</span>
              <span>Mark All Present</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-lg font-bold transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            {!indexedDBSupported ? (
              <span className="text-amber-700 flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <span>⚠️</span>
                <span>Offline storage unavailable in this browser environment. Online sync only.</span>
              </span>
            ) : syncStatus.syncState === 'syncing' ? (
              <span className="text-sky-700 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>Syncing attendance updates with school server...</span>
              </span>
            ) : syncStatus.pendingCount > 0 || !syncStatus.isOnline ? (
              <span className="text-amber-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Saved on device ({syncStatus.pendingCount} update{syncStatus.pendingCount > 1 ? 's' : ''} waiting)</span>
              </span>
            ) : syncStatus.syncState === 'sync_failed' ? (
              <span className="text-rose-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Sync failed ({syncStatus.lastError || 'Retry queued'})</span>
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>All attendance synced</span>
              </span>
            )}
          </div>

          {(syncStatus.pendingCount > 0 || syncStatus.syncState === 'sync_failed') && (
            <button
              type="button"
              onClick={() => syncEngine.triggerSync()}
              className="px-3 py-1 rounded-lg bg-slate-900 text-white font-bold text-[11px] hover:bg-slate-800 transition-all active:scale-95"
            >
              Sync Now
            </button>
          )}
        </div>

        {/* Attendance Statistics Summary Pills */}
        <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <span className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-700">
            Total: {summary.total}
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-50 font-bold text-emerald-800 border border-emerald-200">
            Present: {summary.present}
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-50 font-bold text-rose-800 border border-rose-200">
            Absent: {summary.absent}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-50 font-bold text-amber-800 border border-amber-200">
            Late: {summary.late}
          </span>
          <span className="px-3 py-1 rounded-xl bg-purple-50 font-bold text-purple-800 border border-purple-200">
            Medical: {summary.medical}
          </span>
        </div>

        {/* Search & Filter Input */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <input
            type="text"
            placeholder="Search student by name or roll number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 font-medium placeholder:text-slate-400"
          />
        </div>

        {/* Student Roster Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          {rosterLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              Loading class roster...
            </div>
          ) : rosterUnavailableOffline ? (
            <div className="py-12 text-center space-y-3 max-w-md mx-auto">
              <div className="text-3xl">📡</div>
              <h3 className="font-display font-extrabold text-slate-900 text-base">Class roster unavailable offline</h3>
              <p className="text-slate-500 text-xs">
                Connect to the internet once to load this class roster onto your device.
              </p>
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-medium">
              No students match query &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredRoster.map((student) => {
              const status = student.currentStatus || 'present';
              return (
                <div
                  key={student.studentId}
                  className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-display font-extrabold text-slate-700 text-xs shrink-0">
                      {student.rollNumber || 'S'}
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-slate-900 text-sm">
                        {student.displayName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">Roll #{student.rollNumber || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="grid grid-cols-5 gap-1.5 sm:flex sm:items-center">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, 'present')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, 'absent')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, 'late')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                        status === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      Late
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, 'excused')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                        status === 'excused'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                      }`}
                    >
                      Excused
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(student.studentId, 'medical_leave')}
                      className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all active:scale-95 ${
                        status === 'medical_leave'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                      }`}
                    >
                      Medical
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Attendance changes are automatically saved to your device.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition-all active:scale-95 shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
