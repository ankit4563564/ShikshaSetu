'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import type { SchoolRoleOption } from './types';
import { SCHOOL_ROLES, ROLE_ROUTES } from './constants';
import { RoleCard } from './RoleCard';

type RoleSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected?: (role: string) => void;
};

export function RoleSelector({ isOpen, onClose, onRoleSelected }: RoleSelectorProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = useCallback(
    async (role: SchoolRoleOption) => {
      if (isLoading) return;
      try {
        setIsLoading(true);
        setSelectedRole(role.id);

        // Store role in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('selected_role', role.id);
        }

        // Update Clerk user metadata with the selected role if signed in
        if (user) {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              selectedRole: role.id,
              selectedAt: new Date().toISOString(),
            },
          }).catch(() => null);
        }

        // Call the callback if provided
        if (onRoleSelected) {
          onRoleSelected(role.id);
        }

        // Redirect to the appropriate portal after a brief delay for visual feedback
        const redirectPath = ROLE_ROUTES[role.id] || `/${role.id}`;
        setTimeout(() => {
          router.push(redirectPath);
        }, 300);
      } catch (error) {
        console.error('Error selecting role:', error);
        setIsLoading(false);
      }
    },
    [user, router, onRoleSelected, isLoading]
  );

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
    },
    exit: { scale: 0.9, opacity: 0, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative max-h-[90vh] max-w-4xl w-full bg-paper rounded-3xl shadow-2xl overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-10 p-2 text-deep-teal/60 hover:text-deep-teal transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Content */}
              <div className="p-8 md:p-12">
                {/* Header */}
                <div className="mb-12 text-center">
                  <h2 className="font-display text-3xl md:text-4xl font-extrabold text-deep-teal mb-3">
                    Welcome to ShikshaSetu 👋
                  </h2>
                  <p className="text-lg text-deep-teal/60 max-w-2xl mx-auto">
                    Choose your role to get started. You can explore other roles anytime from your portal.
                  </p>
                </div>

                {/* Role Selection Grid */}
                <div className="space-y-8">
                  {/* Hero Roles */}
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-marigold mb-4">
                      ⭐ Primary Experiences
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {SCHOOL_ROLES.filter((r) => r.isHero).map((role, index) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          index={index}
                          onSelect={handleRoleSelect}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Operational Roles */}
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-deep-teal/40 mb-4">
                      ⚡ Operational Modules
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {SCHOOL_ROLES.filter((r) => !r.isHero).map((role, index) => (
                        <RoleCard
                          key={role.id}
                          role={role}
                          index={index + 2}
                          onSelect={handleRoleSelect}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading && selectedRole && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-deep-teal/20 border-t-deep-teal rounded-full animate-spin" />
                    <p className="text-sm text-deep-teal/60">
                      Setting up your {selectedRole} portal...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
