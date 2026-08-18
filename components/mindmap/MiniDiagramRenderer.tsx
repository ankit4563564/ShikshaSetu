'use client';

import React from 'react';
import type { DeclarativeDiagramType } from '@/lib/mindmap/types';

interface MiniDiagramRendererProps {
  diagramType: DeclarativeDiagramType;
  data?: Record<string, any>;
  accentColor?: string;
  className?: string;
}

export default function MiniDiagramRenderer({
  diagramType,
  data = {},
  accentColor = 'blue',
  className = '',
}: MiniDiagramRendererProps) {
  switch (diagramType) {
    case 'circuit-capacitor':
      return (
        <div className={`my-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center ${className}`}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Parallel Plate Schematic
          </div>
          <svg viewBox="0 0 240 90" className="w-full max-w-[220px] mx-auto h-20 overflow-visible">
            {/* Left Plate (+Q) */}
            <rect x="60" y="10" width="8" height="70" rx="3" fill="#3b82f6" />
            <text x="50" y="48" fontSize="11" fontWeight="bold" fill="#1e40af" textAnchor="end">+Q</text>

            {/* Right Plate (-Q) */}
            <rect x="160" y="10" width="8" height="70" rx="3" fill="#ef4444" />
            <text x="178" y="48" fontSize="11" fontWeight="bold" fill="#991b1b" textAnchor="start">-Q</text>

            {/* Electric Field Vectors */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
            </defs>
            <line x1="72" y1="25" x2="154" y2="25" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <line x1="72" y1="45" x2="154" y2="45" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            <line x1="72" y1="65" x2="154" y2="65" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
            
            <text x="114" y="42" fontSize="9" fontWeight="bold" fill="#475569" textAnchor="middle">E-field (→)</text>

            {/* Distance Marker d */}
            <line x1="68" y1="85" x2="160" y2="85" stroke="#94a3b8" strokeWidth="1" />
            <text x="114" y="83" fontSize="9" fontWeight="bold" fill="#64748b" textAnchor="middle">distance d</text>
          </svg>
        </div>
      );

    case 'process-flow':
      const steps = Array.isArray(data?.steps) ? data.steps : ['Initial State', 'Action / Charge', 'Equilibrium'];
      return (
        <div className={`my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 ${className}`}>
          <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-700">
            {steps.map((step: string, idx: number) => (
              <React.Fragment key={idx}>
                <div className="px-2 py-1 bg-white border border-slate-300 rounded-lg shadow-2xs text-center flex-1">
                  {step}
                </div>
                {idx < steps.length - 1 && <span className="text-slate-400 font-black">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      );

    case 'comparison':
      return (
        <div className={`my-2 rounded-xl bg-white border border-slate-200 overflow-hidden text-[11px] ${className}`}>
          <div className="grid grid-cols-2 bg-slate-100 font-bold text-slate-700 border-b border-slate-200 p-1.5 text-center">
            <span>{data?.col1Title || 'Series'}</span>
            <span>{data?.col2Title || 'Parallel'}</span>
          </div>
          <div className="grid grid-cols-2 p-2 text-slate-600 gap-2">
            <div className="text-center font-medium">{data?.col1Content || 'Charge Q is same across all'}</div>
            <div className="text-center font-medium border-l border-slate-100 pl-2">{data?.col2Content || 'Voltage V is same across all'}</div>
          </div>
        </div>
      );

    case 'hierarchy':
      return (
        <div className={`my-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center ${className}`}>
          <div className="inline-block px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-xs text-slate-800 shadow-2xs">
            {data?.root || 'Core Concept'}
          </div>
          <div className="w-0.5 h-3 bg-slate-300 mx-auto my-0.5" />
          <div className="flex justify-center gap-3">
            {(data?.branches || ['Branch A', 'Branch B']).map((b: string, i: number) => (
              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-600">
                {b}
              </span>
            ))}
          </div>
        </div>
      );

    case 'physics-setup':
    default:
      return (
        <div className={`my-2 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-center ${className}`}>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
            {data?.title || 'Conceptual Relationship Diagram'}
          </div>
          <p className="text-[11px] text-slate-600 mt-1">
            {data?.description || 'Interaction between dielectric polarity and external electrostatic field.'}
          </p>
        </div>
      );
  }
}
