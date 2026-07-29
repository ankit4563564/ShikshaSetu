'use client';

import { useState } from 'react';
import { CampusScanner } from '@/components/campus-id/CampusScanner';
import { processScanWithPortalAction } from '@/app/actions/campusIdActions';
import type { ScanOutput, ScanMode } from '@/lib/campus-id/types';

interface QuickScanFABProps {
  mode?: ScanMode;
  portal?: 'teacher' | 'gate' | 'admin';
  label?: string;
}

export function QuickScanFAB({ mode = 'attendance', portal = 'teacher', label = 'Scan' }: QuickScanFABProps) {
  const [open, setOpen] = useState(false);

  const handleScan = async (qrContent: string, scanMode: ScanMode): Promise<ScanOutput> => {
    return processScanWithPortalAction(qrContent, scanMode, portal, {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    });
  };

  return (
    <>
      {/* Floating action button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
        aria-label={label}
      >
        <span className="text-xl">📷</span>
      </button>

      {/* Scanner Modal */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-deep-teal">Quick Scan</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-deep-teal/50 hover:bg-deep-teal/5 hover:text-deep-teal"
              >
                ✕
              </button>
            </div>
            <CampusScanner
              mode={mode}
              onScan={handleScan}
              onReset={() => setOpen(false)}
              allowManualEntry={true}
              modeLabel={label}
              modeDescription="Scan a Campus Pass to view student details"
            />
          </div>
        </div>
      )}
    </>
  );
}
