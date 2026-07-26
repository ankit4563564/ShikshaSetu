'use client';

import Link from 'next/link';

export function FooterV4() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 pt-16 pb-12 font-body text-slate-600 relative">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white font-display text-sm font-black flex items-center justify-center shadow-xs">
                S
              </div>
              <span className="font-display text-lg font-black text-slate-900 tracking-tight">ShikshaSetu</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              One connected school day for parents, teachers, students and campus teams.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">Product</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><Link href="/parent" className="hover:text-blue-600">For Parents</Link></li>
              <li><Link href="/teacher" className="hover:text-blue-600">For Teachers</Link></li>
              <li><Link href="/admin" className="hover:text-blue-600">For Schools</Link></li>
              <li><Link href="#features" className="hover:text-blue-600">Features</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">Company</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><Link href="#about" className="hover:text-blue-600">About Us</Link></li>
              <li><Link href="#careers" className="hover:text-blue-600">Careers</Link></li>
              <li><Link href="#partners" className="hover:text-blue-600">Partners</Link></li>
              <li><Link href="#blog" className="hover:text-blue-600">Blog</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="font-display text-xs font-black uppercase tracking-wider text-slate-900">Resources</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><Link href="#help" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="#privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><Link href="#contact" className="hover:text-blue-600">Contact us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
          <p>&copy; 2026 ShikshaSetu. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500 font-bold">
            <a href="#talk" className="hover:text-blue-600">💬 Talk to us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
