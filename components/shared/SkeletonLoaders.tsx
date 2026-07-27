'use client';

import React from 'react';

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs space-y-4 animate-pulse ${className}`}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded-full w-1/3" />
        <div className="h-4 bg-slate-200 rounded-full w-1/6" />
      </div>
      <div className="h-3 bg-slate-150 rounded-full w-2/3" />
      <div className="space-y-2 pt-2">
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
        <div className="h-10 bg-slate-100 rounded-xl w-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 w-full animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="space-y-1">
              <div className="h-3.5 bg-slate-200 rounded-full w-32" />
              <div className="h-2.5 bg-slate-150 rounded-full w-20" />
            </div>
          </div>
          <div className="h-3 bg-slate-200 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export function TextBlockSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-slate-200 rounded-full"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
