import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white w-full pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
        
        {/* Top Mini CTA Banner */}
        <div className="bg-gradient-to-r from-primary via-slate-900 to-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 mb-16">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-2xl font-bold font-display text-white">Ready to see it live?</h3>
            <p className="text-slate-300 text-sm">Experience a full connected school day walkthrough in 7 minutes.</p>
          </div>
          <Link
            href="/parent"
            className="bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed px-6 py-3 rounded-full font-bold text-sm transition-all shadow-lg shrink-0 flex items-center gap-2"
          >
            Enter Live Portal
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* 4 Main Footer Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
              <span className="font-display-lg text-xl font-bold text-white">ShikshaSetu</span>
            </div>
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
            <h4 className="font-label-sm text-xs text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Product</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><a className="hover:text-white transition-colors" href="#parents">For Parents</a></li>
              <li><a className="hover:text-white transition-colors" href="#teachers">For Teachers</a></li>
              <li><a className="hover:text-white transition-colors" href="#schoolgpt">SchoolGPT AI</a></li>
              <li><a className="hover:text-white transition-colors" href="#modules">Campus Modules</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-xs text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Security &amp; Trust</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> DPDP Act 2023 Compliant</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> ISO 27001 Certified</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> 256-bit SSL Encryption</li>
              <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> CBSE Data Safe</li>
            </ul>
          </div>

          <div>
            <h4 className="font-label-sm text-xs text-secondary-fixed uppercase tracking-wider mb-4 font-bold">Connect</h4>
            <div className="flex items-center gap-3 mb-4">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">𝕏</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">in</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-secondary-container transition-colors">
                <span className="font-bold text-xs">▶</span>
              </a>
            </div>
            <p className="text-xs text-slate-400">Dedicated support 24/7 for partner schools.</p>
          </div>
        </div>

        {/* Bottom Legal Row */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© 2024 ShikshaSetu Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-slate-300 transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-slate-300 transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-slate-300 transition-colors" href="#">Data Security Protocol</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
