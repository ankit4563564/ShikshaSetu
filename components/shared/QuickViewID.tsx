'use client';

import { useState } from 'react';
import { CampusIdCard } from '@/components/campus-id/CampusIdCard';

interface QuickViewIDProps {
  studentId: string;
  studentName: string;
  grade: string;
  section: string | null;
  rollNumber: string | null;
  avatarUrl: string | null;
  house: string | null;
  guardianName: string | null;
  busRoute: string | null;
}

export function QuickViewID(props: QuickViewIDProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/10"
      >
        View Campus Pass
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative max-w-sm w-full">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-deep-teal/70 hover:text-deep-teal"
            >
              ✕
            </button>
            <CampusIdCard {...props} />
          </div>
        </div>
      )}
    </>
  );
}
