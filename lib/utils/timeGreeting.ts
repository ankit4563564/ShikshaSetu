'use client';

import { useState, useEffect } from 'react';

/**
 * Returns time-sensitive greeting based on the user's local time:
 * - 04:00 – 11:59: "Good morning"
 * - 12:00 – 16:59: "Good afternoon"
 * - 17:00 – 03:59: "Good evening"
 */
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return 'Good morning';
  }
  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Returns greeting with context emoji
 */
export function getTimeGreetingWithEmoji(date: Date = new Date()): { greeting: string; emoji: string } {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) {
    return { greeting: 'Good morning', emoji: '🌅' };
  }
  if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', emoji: '☀️' };
  }
  return { greeting: 'Good evening', emoji: '🌙' };
}

/**
 * React hook that returns dynamic time greeting and automatically updates
 * as time progresses without SSR hydration issues.
 */
export function useTimeGreeting(): string {
  const [greeting, setGreeting] = useState<string>(() => getTimeBasedGreeting());

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());
    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return greeting;
}
