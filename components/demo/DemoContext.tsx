"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface DemoUser {
  id: string;
  fullName: string;
  imageUrl: string;
  primaryEmailAddressId: string;
  primaryPhoneNumberId: string | null;
  username: string | null;
  publicMetadata: Record<string, any>;
}

interface DemoContextType {
  user: DemoUser | null;
  isDemoMode: boolean;
  isLoading: boolean;
  demoLogin: (role: string) => Promise<void>;
  logout: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

interface DemoProviderProps {
  children: React.ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isDemoMode = 
    process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
    process.env.NODE_ENV === 'development';

  const demoLogin = async (role: string) => {
    if (!isDemoMode) {
      throw new Error('Demo mode not enabled');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Demo login failed');
      }

      const data = await response.json();

      if (data.success) {
        // Create a DemoUser from the API response
        const demoUser: DemoUser = {
          id: data.userId,
          fullName: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
          imageUrl: '',
          primaryEmailAddressId: data.email || '',
          primaryPhoneNumberId: null,
          username: null,
          publicMetadata: { role: data.role },
        };

        setUser(demoUser);

        // Store demo session info
        localStorage.setItem('demoUserId', data.userId);
        localStorage.setItem('demoRole', role);
      } else {
        throw new Error('Demo login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('demoUserId');
    localStorage.removeItem('demoRole');
  };

  useEffect(() => {
    // Check for existing demo session on mount
    const storedUserId = localStorage.getItem('demoUserId');
    const storedRole = localStorage.getItem('demoRole');
    
    if (storedUserId && storedRole && isDemoMode) {
      // Simple session restoration — real Clerk session is managed by ClerkProvider
      const demoUser: DemoUser = {
        id: storedUserId,
        fullName: `${storedRole.charAt(0).toUpperCase() + storedRole.slice(1)} User`,
        imageUrl: '',
        primaryEmailAddressId: `${storedRole}@shikshasetu.com`,
        primaryPhoneNumberId: null,
        username: null,
        publicMetadata: { role: storedRole },
      };
      setUser(demoUser);
    }
  }, [isDemoMode]);

  return (
    <DemoContext.Provider value={{ user, isDemoMode, isLoading, demoLogin, logout }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
