import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu Legal
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-4">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">Terms of Service</span>
          <h1 className="text-3xl font-extrabold text-white">Terms of Service &amp; Campus Agreement</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            By accessing ShikshaSetu applications and hardware telemetry APIs, partner schools and authorized guardians agree to our standard service level agreement, security protocols, and operational terms.
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
