'use client';

import { useEffect, useState } from 'react';
import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { RoleSelector } from '@/components/onboarding';

const demoProfiles = [
  {
    id: 'teacher',
    name: 'Ananya Mehra',
    role: 'Class 8A Teacher',
    emoji: '🍎',
    color: 'marigold',
    email: 'teacher@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'parent',
    name: 'Sunita Sharma',
    role: "Aarav's Parent",
    emoji: '👨‍👩‍👧',
    color: 'sage',
    email: 'parent@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'student',
    name: 'Aarav Sharma',
    role: 'Class 8A Student',
    emoji: '🫙',
    color: 'deep-teal',
    email: 'student@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'gate',
    name: 'Gate Security',
    role: 'Gate Scanner',
    emoji: '🛡️',
    color: 'warm-clay',
    email: 'gate@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'driver',
    name: 'Driver Demo',
    role: 'Bus Driver',
    emoji: '🚌',
    color: 'deep-teal',
    email: 'driver@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'vendor',
    name: 'Vendor Demo',
    role: 'School Vendor',
    emoji: '📦',
    color: 'marigold',
    email: 'vendor@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
  {
    id: 'admin',
    name: 'Admin Demo',
    role: 'School Administrator',
    emoji: '⚙️',
    color: 'warm-clay',
    email: 'admin@shikshasetu.com',
    password: 'ShikshaSetu2026!',
  },
];

export default function SignUpPage() {
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  const colorClasses = {
    'marigold': 'bg-marigold/10 border-marigold/30 text-marigold',
    'sage': 'bg-sage/10 border-sage/30 text-sage',
    'deep-teal': 'bg-deep-teal/10 border-deep-teal/30 text-deep-teal',
    'warm-clay': 'bg-warm-clay/10 border-warm-clay/30 text-warm-clay',
  };

  const handleSignUpComplete = () => {
    setShowRoleSelector(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden p-6">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 rounded-full bg-deep-teal/5 blur-3xl pointer-events-none select-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-sage/5 blur-3xl pointer-events-none select-none" />

      {/* Main Container */}
      <div className="max-w-4xl w-full flex flex-col md:flex-row gap-8 items-center justify-center relative z-10">
        
        {/* Column 1: Demo Credentials */}
        <div className="w-full max-w-md bg-white/75 backdrop-blur-md border border-deep-teal/10 rounded-3xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 mx-auto">
          <div className="space-y-1.5 text-center md:text-left">
            <h2 className="font-display text-lg font-extrabold text-deep-teal">Demo Credentials</h2>
            <p className="font-body text-xs text-deep-teal/50">Sign up with these credentials to explore ShikshaSetu</p>
          </div>

          <div className="space-y-2.5">
            {demoProfiles.map((profile) => (
              <div
                key={profile.id}
                className="w-full p-3 bg-paper border border-deep-teal/10 hover:border-deep-teal/20 hover:shadow-xs rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3.5 mb-2">
                  <div className={`text-xl p-2 rounded-xl ${colorClasses[profile.color as keyof typeof colorClasses]}`}>
                    {profile.emoji}
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-xs font-extrabold text-deep-teal">{profile.name}</div>
                    <div className="text-[9px] font-bold text-deep-teal/40 uppercase tracking-wider">{profile.role}</div>
                  </div>
                </div>
                <div className="space-y-1.5 mt-3 pt-3 border-t border-deep-teal/5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-deep-teal/50 font-semibold">Email:</span>
                    <span className="text-deep-teal font-mono">{profile.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-deep-teal/50 font-semibold">Password:</span>
                    <span className="text-deep-teal font-mono">{profile.password}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Clerk Sign-Up Form */}
        <div className="w-full flex items-center justify-center animate-in fade-in slide-in-from-right-4 duration-500">
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            afterSignUpUrl="/onboarding"
            appearance={{
              variables: {
                colorPrimary: '#1f4e5f',
                colorBackground: '#fbf8f3',
                fontFamily: 'Inter, sans-serif',
              },
              elements: {
                card: 'shadow-sm border border-deep-teal/5 rounded-2xl w-full max-w-sm',
              }
            }}
          />
        </div>

      </div>

      {/* Role Selector Modal */}
      <RoleSelector 
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
      />
    </div>
  );
}
