'use client';

import Link from 'next/link';
import { m as motion } from 'framer-motion';

export default function CTA() {
  return (
    <section id="final-cta" className="mx-auto max-w-6xl px-6 py-20 lg:px-8 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[40px] bg-[#1f4e5f] px-8 py-16 text-center text-white shadow-[0_30px_70px_rgba(31,78,95,0.25)] sm:px-16 sm:py-24"
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#e8a33d]/25 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-[#6b9080]/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/90 backdrop-blur-md">
            SEE IT IN ACTION
          </span>

          <h2 className="mx-auto max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl leading-tight">
            Walk a full school day in seven minutes.
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80">
            Run the live demo, or step into any role portal and follow the same chain from gate to home.
          </p>

          <div className="pt-4 flex flex-col justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#e8a33d] to-[#f4c875] px-8 py-4 text-sm font-extrabold text-[#1f4e5f] shadow-[0_10px_30px_rgba(232,163,61,0.35)] transition-all hover:shadow-[0_15px_40px_rgba(232,163,61,0.5)]"
              >
                Watch the school day →
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-8 py-4 text-sm font-extrabold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40"
              >
                Enter a portal
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
