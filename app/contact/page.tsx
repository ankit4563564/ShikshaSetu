import React from 'react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-2xl mx-auto w-full space-y-8">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu Contact
          </Link>
          <Link href="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">Get in Touch</span>
          <h1 className="text-3xl font-extrabold text-white">Contact Our School Support Team</h1>
          <p className="text-slate-400 text-xs">We typically respond within 2 hours during school operating hours.</p>
        </div>

        <form className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
            <input type="text" required placeholder="Principal Sunita Sharma" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary-container" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">School &amp; City</label>
            <input type="text" required placeholder="Delhi Public School, Noida" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary-container" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email / Phone</label>
            <input type="text" required placeholder="sunita@dpsnoida.edu.in" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary-container" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">How can we help?</label>
            <textarea rows={3} required placeholder="We would like a live campus demo..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-secondary-container" />
          </div>
          <button type="submit" className="w-full bg-secondary-container text-slate-950 py-3 rounded-xl font-bold text-xs hover:bg-secondary-fixed">
            Send Message →
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
