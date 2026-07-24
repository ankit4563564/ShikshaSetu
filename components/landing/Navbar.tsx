'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-4 z-50 mx-auto w-[92%] max-w-7xl"
    >
      <div className="flex items-center justify-between rounded-full border border-white/80 bg-white/75 px-5 py-3 shadow-[0_20px_50px_rgba(31,78,95,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/90 sm:px-7">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-deep-teal text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <span className="text-base font-black">S</span>
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-deep-teal transition-opacity group-hover:opacity-90 sm:text-xl">
            ShikshaSetu
          </span>
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-8 text-xs font-bold text-[#1f4e5f]/70 md:flex">
          <a href="#promises-section" className="transition-colors hover:text-deep-teal">Promises</a>
          <a href="#tracking" className="transition-colors hover:text-deep-teal">Journey</a>
          <a href="#demo-section" className="transition-colors hover:text-deep-teal">Portals</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/demo"
            className="hidden text-xs font-bold text-deep-teal/80 transition-colors hover:text-deep-teal sm:block"
          >
            Watch demo
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-full bg-deep-teal px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_20px_rgba(31,78,95,0.22)] transition-all hover:bg-[#1a4250] hover:shadow-[0_12px_25px_rgba(31,78,95,0.32)] sm:px-6"
            >
              Enter portals →
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
