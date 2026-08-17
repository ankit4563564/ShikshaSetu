'use client';

import React from 'react';
import Link from 'next/link';
import { useLandingModal } from './LandingModalContext';

export function Footer() {
  const { openRoleSelector, openLeadModal } = useLandingModal();

  return (
    <footer className="bg-slate-950 text-white w-full pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        
        {/* Top Mini CTA Banner */}
        <div className="bg-gradient-to-r from-primary via-slate-900 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl font-bold font-display text-white">Ready to see it live?</h3>
            <p className="text-slate-300 text-[15px]">Experience a full connected school day walkthrough in 7 minutes.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={openRoleSelector}
              className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed px-6 py-3 rounded-full font-bold text-[15px] transition-all shadow-lg shrink-0 flex items-center gap-2"
            >
              Enter Live Portal
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button
              onClick={() => openLeadModal('Request Campus Trial')}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-full font-bold text-[15px] transition-all"
            >
              Request School Onboarding
            </button>
          </div>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span className="font-display-lg text-xl font-bold text-white">ShikshaSetu</span>
            </Link>
            <p className="font-body-md text-sm text-slate-400 max-w-xs leading-relaxed">
              One connected school day for parents, teachers, and campus administration teams.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1 font-mono">
              <p>📍 Noida &amp; New Delhi, India</p>
              <p>✉️ support@shikshasetu.in</p>
              <p>📞 +91 (120) 456-7890</p>
            </div>
          </div>

          <div>
            <h4 className="font-label-sm text-[13px] text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Product Navigation</h4>
            <ul className="space-y-2.5 text-[15px] text-slate-400">
              <li><Link className="hover:text-white transition-colors" href="/parent">Parent Portal</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/teacher">Teacher Workstation</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/admin">School Operations</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/gate">Gate Security Console</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/pricing">Pricing Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-[13px] text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Security &amp; Trust</h4>
            <ul className="space-y-2.5 text-[15px] text-slate-400">
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> DPDP Act 2023 Compliant</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> ISO 27001 Certified</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 256-bit SSL Encryption</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> CBSE Data Safe</li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-[13px] text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Resources &amp; Support</h4>
            <ul className="space-y-2.5 text-[15px] text-slate-400 mb-4">
              <li><Link className="hover:text-white transition-colors" href="/resources">Resource Center</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/blog">Blog &amp; Insights</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/support">Help &amp; Documentation</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/contact">Contact Support</Link></li>
            </ul>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">𝕏</span>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">in</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">▶</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-500 font-medium">
          <p>© 2024 ShikshaSetu Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="hover:text-slate-300 transition-colors" href="/privacy">Privacy Policy</Link>
            <Link className="hover:text-slate-300 transition-colors" href="/terms">Terms of Service</Link>
            <Link className="hover:text-slate-300 transition-colors" href="/about">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
