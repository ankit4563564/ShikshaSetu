import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">About ShikshaSetu</span>
          <h1 className="text-4xl font-extrabold text-white">Connecting Every School Day for Every Child</h1>
          <p className="text-slate-300 text-base leading-relaxed">
            ShikshaSetu was built to solve the anxiety, friction, and disconnection experienced across Indian K-12 school days. By linking gate entry security, bus telemetry, classroom engagement, and parent communication into one intelligent AI layer, we bring peace of mind to parents and time back to teachers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-2xl font-extrabold text-secondary-fixed">500+</h3>
            <p className="text-xs text-slate-400 mt-1">Partner Schools Across India</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-2xl font-extrabold text-emerald-400">10M+</h3>
            <p className="text-xs text-slate-400 mt-1">Daily Connected Interactions</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="text-2xl font-extrabold text-sky-400">99.9%</h3>
            <p className="text-xs text-slate-400 mt-1">Platform Uptime Reliability</p>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
