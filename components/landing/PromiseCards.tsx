'use client';

import { m as motion } from 'framer-motion';

export default function PromiseCards() {
  const promises = [
    {
      num: '01',
      title: 'Wellness Check',
      description: 'Morning emotional signals capture student mood before class starts, establishing a supportive environment.',
      accent: 'border-t-[#6b9080]',
      dotColor: 'bg-[#6b9080]',
      bgGlow: 'from-[#6b9080]/10 to-transparent',
    },
    {
      num: '02',
      title: 'Secure Transport',
      description: 'Real-time updates map boarding, route progress, and safe gate admissions, keeping parents completely at ease.',
      accent: 'border-t-[#e8a33d]',
      dotColor: 'bg-[#e8a33d]',
      bgGlow: 'from-[#e8a33d]/10 to-transparent',
    },
    {
      num: '03',
      title: 'Attention Queue',
      description: 'Automated rules surface students needing teacher focus, allowing teachers to spend time where it matters most.',
      accent: 'border-t-[#c06c5c]',
      dotColor: 'bg-[#c06c5c]',
      bgGlow: 'from-[#c06c5c]/10 to-transparent',
    },
  ];

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as any,
    },
  };

  return (
    <section id="promises-section" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28 scroll-mt-24">
      <div className="relative rounded-[32px] bg-white/60 border border-white/80 p-8 md:p-14 shadow-[0_20px_60px_rgba(31,78,95,0.04)] backdrop-blur-xl overflow-hidden">
        {/* Glow background accent */}
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#6b9080]/10 blur-3xl" />

        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[#1f4e5f]/10 pb-10 relative z-10"
        >
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1f4e5f]/50">
              OUR CORE PROMISES
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1f4e5f] leading-tight tracking-tight">
              Three quiet promises for an <span className="text-[#e8a33d]">extraordinary</span> day.
            </h2>
          </div>
          <p className="max-w-xs text-xs font-semibold leading-relaxed text-[#1f4e5f]/70">
            Three interconnected systems built to guarantee campus security, emotional wellbeing, and clear operational awareness.
          </p>
        </motion.div>

        {/* Grid Layout with Glass Cards */}
        <motion.div 
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-12 relative z-10"
        >
          {promises.map((item) => (
            <motion.div
              key={item.num}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`group relative overflow-hidden rounded-2xl border border-[#1f4e5f]/10 ${item.accent} border-t-4 bg-white/90 p-7 shadow-[0_10px_30px_rgba(31,78,95,0.03)] backdrop-blur-md space-y-4 transition-all duration-300 hover:shadow-[0_20px_45px_rgba(31,78,95,0.09)]`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${item.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="flex justify-between items-center relative z-10">
                <span className="text-xs font-black tracking-wider text-[#1f4e5f]/40">{item.num}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${item.dotColor} shadow-sm`} />
              </div>
              <h3 className="text-lg font-extrabold text-[#1f4e5f] tracking-tight relative z-10">{item.title}</h3>
              <p className="text-xs font-normal leading-relaxed text-[#1f4e5f]/75 relative z-10">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
