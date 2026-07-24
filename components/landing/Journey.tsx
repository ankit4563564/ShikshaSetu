'use client';

import { m as motion } from 'framer-motion';

export default function Journey() {
  const steps = [
    { num: '01', title: 'Wellness Check', desc: 'Parent logs morning mood' },
    { num: '02', title: 'Teacher Alert', desc: 'Rules engine flags status' },
    { num: '03', title: 'AI Narration', desc: 'Teacher voice summary' },
    { num: '04', title: 'Gate Pass', desc: 'Secure passcode approved' },
    { num: '05', title: 'Gate Match', desc: 'Guard visual verifies photo' },
    { num: '06', title: 'Safe Home', desc: 'Parent confirms drop-off' },
  ];

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' as any },
    },
  };

  return (
    <section id="workflow-section" className="mx-auto max-w-7xl px-6 py-16 md:py-24 lg:px-8 scroll-mt-24">
      <div className="relative rounded-3xl bg-white/40 border border-deep-teal/[0.04] p-8 md:p-12 shadow-3xs overflow-hidden">
        {/* Glow accent */}
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sage/5 blur-3xl" />
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-deep-teal/10 pb-8 relative z-10"
        >
          <div>
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-deep-teal/40 block mb-2">Ecosystem Storyline</span>
            <h2 className="font-serif italic font-semibold text-deep-teal text-3xl md:text-5xl leading-tight">
              The Connected <span className="font-display font-extrabold text-deep-teal not-italic">Journey.</span>
            </h2>
          </div>
          <p className="max-w-xs font-body text-xs font-semibold leading-relaxed text-deep-teal/55">
            Six automated check-ins linked together in real-time.
          </p>
        </motion.div>

        {/* Stepper timeline */}
        <div className="relative pt-10 pb-4 z-10">
          {/* Horizontal line connector with scale animate */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute top-15 left-8 right-8 h-[2px] bg-deep-teal/10 hidden md:block origin-left"
          />

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 md:grid-cols-6 relative z-10"
          >
            {steps.map((step) => (
              <motion.div 
                key={step.num} 
                variants={stepVariants}
                className="flex flex-col items-center text-center space-y-3 group"
              >
                {/* Node bubble */}
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="h-10 w-10 rounded-full border-2 border-sage bg-white flex items-center justify-center font-display text-xs font-bold text-sage shadow-2xs transition-shadow hover:shadow-sm"
                >
                  {step.num}
                </motion.div>
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-extrabold text-deep-teal leading-tight">{step.title}</h4>
                  <p className="font-body text-[10px] text-deep-teal/55 leading-snug">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
