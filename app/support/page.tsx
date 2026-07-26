import React from 'react';
import Link from 'next/link';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu Support
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">Help &amp; Documentation</span>
          <h1 className="text-3xl font-extrabold text-white">How Can We Assist Your School Today?</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Parent App Setup Guide</h3>
            <p className="text-xs text-slate-400">Step-by-step instructions for adding child profiles and configuring live bus notifications.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Gate RFID &amp; Scanner Hardware</h3>
            <p className="text-xs text-slate-400">Troubleshooting gate pass readers, camera sync, and offline buffer logging.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">SchoolGPT Workstation Training</h3>
            <p className="text-xs text-slate-400">Teacher prompts, automated quiz creation, and parent message templates.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-sm">Driver GPS Transit Hardware</h3>
            <p className="text-xs text-slate-400">OBD-II GPS tracker setup, mobile driver app pairing, and speed alert limits.</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
