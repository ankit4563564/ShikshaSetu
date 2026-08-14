// ┌─────────────────────────────────────────────────────────┐
// │  DEV-ONLY: Remove this entire file when real auth is   │
// │  implemented. Search the codebase for "DEV-ONLY" to    │
// │  find every piece that needs to go.                    │
// └─────────────────────────────────────────────────────────┘

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Portal } from '@/types';
import { useRole } from './RoleContext';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROLES: { value: Portal; label: string; emoji: string }[] = [
  { value: 'teacher', label: 'Teacher', emoji: '🍎' },
  { value: 'parent', label: 'Parent', emoji: '👨‍👩‍👧' },
  { value: 'admin', label: 'Admin', emoji: '🏫' },
  { value: 'student', label: 'Student', emoji: '🎒' },
  { value: 'gate', label: 'Gate', emoji: '🚪' },
  { value: 'driver', label: 'Driver', emoji: '🚌' },
  { value: 'vendor', label: 'Vendor', emoji: '📦' },
];

/** Maps each role to its EduSync accent colour for the status dot. */
const ROLE_COLORS: Partial<Record<Portal, string>> = {
  teacher: 'var(--deep-teal)',
  parent: 'var(--sage)',
  admin: 'var(--marigold)',
  student: 'var(--warm-clay)',
  gate: 'var(--deep-teal)',
  driver: 'var(--sage)',
  vendor: 'var(--marigold)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RoleSwitcher() {
  const pathname = usePathname();
  
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only render after hydration — avoids SSR/client mismatch from emoji
  // ZWJ characters and dynamic inline styles.
  useEffect(() => setMounted(true), []);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+Shift+R to toggle the switcher
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ✅ C1 FIX: Hide in production mode OR demo routes
  // This prevents the DEV badge from appearing in presentations/demos
  if (process.env.NODE_ENV === 'production' || pathname?.startsWith('/demo')) {
    return null;
  }

  const currentRole = ROLES.find((r) => r.value === role)!;

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      aria-label="Development role switcher"
    >
      {/* ── Floating trigger pill ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          border: '1px solid rgba(31, 78, 95, 0.15)',
          borderRadius: '9999px',
          backgroundColor: 'var(--paper)',
          color: 'var(--deep-teal)',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(31, 78, 95, 0.12)',
          transition: 'box-shadow 0.2s ease, transform 0.15s ease',
          transform: open ? 'scale(0.97)' : 'scale(1)',
        }}
      >
        {/* Status dot */}
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: ROLE_COLORS[role],
            flexShrink: 0,
          }}
        />
        <span>{currentRole.emoji}</span>
        <span style={{ letterSpacing: '0.02em' }}>
          {currentRole.label}
        </span>
        <span
          style={{
            fontSize: '10px',
            opacity: 0.4,
            fontFamily: '"IBM Plex Mono", monospace',
          }}
        >
          DEV
        </span>
        {/* Chevron */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M3 5L6 8L9 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── Dropdown menu ── */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            backgroundColor: 'var(--paper)',
            border: '1px solid rgba(31, 78, 95, 0.12)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(31, 78, 95, 0.14)',
            overflow: 'hidden',
            animation: 'devSwitcherFadeIn 0.15s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px 6px',
              fontSize: '10px',
              fontFamily: '"IBM Plex Mono", monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--sage)',
              borderBottom: '1px solid rgba(31, 78, 95, 0.06)',
            }}
          >
            Switch portal · <kbd style={{ fontSize: '10px' }}>Ctrl+Shift+R</kbd>
          </div>

          {/* Role options */}
          {ROLES.map(({ value, label, emoji }) => {
            const isActive = value === role;
            return (
              <button
                key={value}
                onClick={() => {
                  setRole(value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  backgroundColor: isActive
                    ? 'rgba(31, 78, 95, 0.06)'
                    : 'transparent',
                  color: 'var(--deep-teal)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'rgba(31, 78, 95, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      'transparent';
                  }
                }}
              >
                {/* Colour indicator */}
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: ROLE_COLORS[value],
                    flexShrink: 0,
                    boxShadow: isActive
                      ? `0 0 0 3px ${ROLE_COLORS[value]}33`
                      : 'none',
                    transition: 'box-shadow 0.15s ease',
                  }}
                />
                <span>{emoji}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && (
                  <span style={{ fontSize: '11px', opacity: 0.5 }}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}

          {/* Footer hint */}
          <div
            style={{
              padding: '8px 14px',
              fontSize: '10px',
              color: 'var(--warm-clay)',
              opacity: 0.7,
              borderTop: '1px solid rgba(31, 78, 95, 0.06)',
              fontFamily: '"IBM Plex Mono", monospace',
            }}
          >
            ⚠ dev-only — will not ship
          </div>
        </div>
      )}

      {/* Inline keyframe for the fade-in animation */}
      <style>{`
        @keyframes devSwitcherFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
