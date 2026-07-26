import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 md:p-16 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-12">
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <Link href="/" className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span>🏫</span> ShikshaSetu
          </Link>
          <Link href="/parent" className="bg-secondary-container text-slate-950 px-4 py-2 rounded-full font-bold text-xs">
            Enter Live Portal →
          </Link>
        </div>

        <div className="text-center space-y-4">
          <span className="text-xs font-mono font-bold text-secondary-container uppercase">Transparent School Plans</span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Simple, Predictable Campus Pricing</h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Everything your school needs — gate security, live bus telemetry, parent app, and SchoolGPT AI — with 0 hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400">STARTER SCHOOL</span>
              <h3 className="text-2xl font-bold text-white mt-1">Up to 500 Students</h3>
              <p className="text-3xl font-extrabold text-secondary-fixed mt-4">₹45 <span className="text-xs font-normal text-slate-400">/ student / month</span></p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li>✓ Live Bus GPS Tracking</li>
                <li>✓ Gate Entry Pass QR Scan</li>
                <li>✓ Parent Mobile App</li>
                <li>✓ Basic SchoolGPT AI</li>
              </ul>
            </div>
            <Link href="/" className="w-full bg-slate-800 text-white text-center py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700">
              Select Plan
            </Link>
          </div>

          <div className="bg-slate-900 border-2 border-secondary-container rounded-3xl p-6 flex flex-col justify-between space-y-6 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary-container text-slate-950 px-3 py-0.5 rounded-full text-[10px] font-extrabold">MOST POPULAR</span>
            <div>
              <span className="text-xs font-mono text-secondary-container">STANDARD CAMPUS</span>
              <h3 className="text-2xl font-bold text-white mt-1">Up to 2,000 Students</h3>
              <p className="text-3xl font-extrabold text-secondary-fixed mt-4">₹35 <span className="text-xs font-normal text-slate-400">/ student / month</span></p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li>✓ Everything in Starter</li>
                <li>✓ Full SchoolGPT Workstation</li>
                <li>✓ Automated Parent WhatsApp Sync</li>
                <li>✓ Teacher Lesson AI Assistant</li>
              </ul>
            </div>
            <Link href="/" className="w-full bg-secondary-container text-slate-950 text-center py-2.5 rounded-xl font-bold text-xs hover:bg-secondary-fixed">
              Start 30-Day Campus Trial
            </Link>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono text-slate-400">ENTERPRISE NETWORK</span>
              <h3 className="text-2xl font-bold text-white mt-1">2,000+ Students / Group</h3>
              <p className="text-3xl font-extrabold text-secondary-fixed mt-4">Custom <span className="text-xs font-normal text-slate-400">Volume Discount</span></p>
              <ul className="mt-6 space-y-2 text-xs text-slate-300">
                <li>✓ Everything in Standard</li>
                <li>✓ Dedicated SLA &amp; On-Site Support</li>
                <li>✓ Custom ERP &amp; Tally Sync</li>
                <li>✓ Custom AI Models &amp; Storage</li>
              </ul>
            </div>
            <Link href="/" className="w-full bg-slate-800 text-white text-center py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700">
              Contact Enterprise Team
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 pt-12 border-t border-slate-800">
        © 2024 ShikshaSetu Technologies. All rights reserved.
      </div>
    </div>
  );
}
