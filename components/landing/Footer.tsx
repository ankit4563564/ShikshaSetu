'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#102A43] text-white w-full py-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 5 Clean Footer Columns matching PNG */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pb-8 border-b border-white/10 text-xs">
          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
              Product
            </h4>
            <ul className="space-y-2 text-stone-300">
              <li><Link href="/teacher" className="hover:text-white transition-colors">Teacher Portal</Link></li>
              <li><Link href="/student" className="hover:text-white transition-colors">Student Portal</Link></li>
              <li><Link href="/parent" className="hover:text-white transition-colors">Parent Portal</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Admin Ledgers</Link></li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
              Company
            </h4>
            <ul className="space-y-2 text-stone-300">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Partners</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
              Resources
            </h4>
            <ul className="space-y-2 text-stone-300">
              <li><Link href="/blog" className="hover:text-white transition-colors">News &amp; Blog</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Teacher Toolkit</Link></li>
              <li><Link href="/resources" className="hover:text-white transition-colors">Parent Guides</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
              Support
            </h4>
            <ul className="space-y-2 text-stone-300">
              <li><Link href="/support" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><a href="#the-difference" className="hover:text-white transition-colors">Schedule a Demo</a></li>
            </ul>
          </div>

          {/* Column 5: Social */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-[11px]">
              Social
            </h4>
            <div className="flex items-center gap-3 text-stone-300">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
                <span className="text-sm font-bold">f</span>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Twitter">
                <span className="text-sm font-bold">𝕏</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
                <span className="text-sm font-bold">📷</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
                <span className="text-sm font-bold">▶</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-400">
          <p>© 2026 ShikshaSetu. All rights reserved.</p>
          <p className="font-mono text-[10px] text-stone-500">Connected School Learning Ecosystem</p>
        </div>
      </div>
    </footer>
  );
}
