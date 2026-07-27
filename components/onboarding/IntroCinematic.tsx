'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import { INTRO_LINES } from './constants';
import { fadeUpVariants } from './motion/variants';

function IntroCinematicComponent() {
  return (
    <m.div
      className="mx-auto flex max-w-2xl flex-col items-center px-4 text-center select-none"
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Icon Badge */}
      <m.div
        variants={fadeUpVariants}
        custom={0}
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 border border-white/15 text-4xl shadow-lg backdrop-blur-md"
        aria-hidden
      >
        🏫
      </m.div>

      {/* Cinematic Text Story Lines with High Contrast & Color Highlights */}
      <div className="w-full space-y-2.5">
        {INTRO_LINES.map((line, index) => {
          const isToday = line.startsWith('Today');
          const isChoose = line.startsWith('Choose whose');
          const isParent = line.includes('Parents');
          const isTeacher = line.includes('Teachers');
          const isDriver = line.includes('Drivers');
          const isStudent = line.includes('Students');

          if (isToday) {
            return (
              <m.p
                key={line}
                variants={fadeUpVariants}
                custom={index * 0.22 + 0.08}
                className="pt-6 font-display text-xl sm:text-2xl font-black uppercase tracking-widest text-[#e8a33d] drop-shadow-sm"
              >
                {line}
              </m.p>
            );
          }

          if (isChoose) {
            return (
              <m.h2
                key={line}
                variants={fadeUpVariants}
                custom={index * 0.22 + 0.08}
                className="pt-1 font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
              >
                {line}
              </m.h2>
            );
          }

          // Role Highlight Lines
          if (isParent || isTeacher || isDriver || isStudent) {
            let roleClass = 'text-white font-bold';
            if (isParent) roleClass = 'text-[#e8a33d] font-bold';
            if (isTeacher) roleClass = 'text-[#6b9080] font-bold';
            if (isDriver) roleClass = 'text-[#38bdf8] font-bold';
            if (isStudent) roleClass = 'text-[#f43f5e] font-bold';

            return (
              <m.p
                key={line}
                variants={fadeUpVariants}
                custom={index * 0.22 + 0.08}
                className={`text-base sm:text-lg ${roleClass} drop-shadow-sm`}
              >
                {line}
              </m.p>
            );
          }

          // Standard Lines
          return (
            <m.p
              key={line}
              variants={fadeUpVariants}
              custom={index * 0.22 + 0.08}
              className="text-sm sm:text-base font-medium text-white/90 leading-relaxed"
            >
              {line}
            </m.p>
          );
        })}
      </div>
    </m.div>
  );
}

export const IntroCinematic = memo(IntroCinematicComponent);
