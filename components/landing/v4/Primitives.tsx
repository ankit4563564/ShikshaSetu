'use client';

import React from 'react';

// SectionWrapper: Enforces strict padding scale and max-width 1280px
export function SectionWrapper({
  children,
  className = '',
  bg = 'bg-[#FAFBFF]',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`w-full py-20 lg:py-28 ${bg} font-body text-slate-900 overflow-hidden relative`}>
      <div className={`max-w-[1280px] mx-auto px-6 lg:px-8 relative z-10 ${className}`}>
        {children}
      </div>
    </section>
  );
}

// SectionHeading: Standardized Eyebrow -> Headline -> Subtitle hierarchy
export function SectionHeading({
  eyebrow,
  title,
  highlight,
  subtitle,
  align = 'center',
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={`space-y-4 max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
      {eyebrow && (
        <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-mono font-extrabold uppercase tracking-widest">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
        {title} {highlight && <span className="text-blue-600">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// Button: Enforces 999px pill border-radius
export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'glass' | 'yellow';
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-extrabold text-xs transition-all active:scale-95 shadow-2xs select-none cursor-pointer';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-md',
    glass: 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200/90 backdrop-blur-md',
    yellow: 'bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-md',
  };

  const compClass = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={compClass}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={compClass}>
      {children}
    </button>
  );
}

// FeatureCard: Enforces 24px card border-radius and soft shadow
export function FeatureCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-8 bg-white border border-slate-200/80 rounded-[24px] shadow-sm hover:shadow-md transition-all ${className}`}>
      {children}
    </div>
  );
}
