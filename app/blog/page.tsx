import React from 'react';
import Link from 'next/link';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu Blog
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">Latest Insights</span>
          <h1 className="text-4xl font-extrabold text-white">Insights on Indian School Innovation</h1>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500">JULY 24, 2024 &middot; 5 MIN READ</span>
            <h3 className="text-xl font-bold text-white">Why Real-Time Bus Telemetry Transforms Parent Trust</h3>
            <p className="text-xs text-slate-400">Exploring how live GPS signals reduce morning phone calls and bring calm to parent routines.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-slate-500">JULY 18, 2024 &middot; 7 MIN READ</span>
            <h3 className="text-xl font-bold text-white">DPDP Act 2023 Compliance Guide for Indian K-12 Schools</h3>
            <p className="text-xs text-slate-400">Everything school administrators need to know about student data protection and cloud security.</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
