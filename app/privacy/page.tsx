import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">DPDP Act 2023 Compliant</span>
          <h1 className="text-3xl font-extrabold text-white">Privacy Policy &amp; Student Data Protection</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            ShikshaSetu treats student and family data with the highest standard of privacy. All GPS transit data, attendance logs, and academic records are encrypted in transit and at rest using 256-bit AES encryption. We never sell, monetize, or share student data with third-party advertisers.
          </p>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
