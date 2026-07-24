'use server';

import { auth } from '@clerk/nextjs/server';
import {
  getDailyScanMetrics,
  getGateThroughputMetrics,
  getScannerHealthMetrics,
} from '@/lib/campus-id/analytics';
import type {
  DailyScanMetrics,
  GateThroughputMetrics,
  ScannerHealthMetrics,
} from '@/lib/campus-id/analytics';

export async function getDailyScanMetricsAction(date?: string): Promise<DailyScanMetrics> {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey) {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');
  }
  return getDailyScanMetrics(date);
}

export async function getGateThroughputMetricsAction(date?: string): Promise<GateThroughputMetrics> {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey) {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');
  }
  return getGateThroughputMetrics(date);
}

export async function getScannerHealthMetricsAction(): Promise<ScannerHealthMetrics[]> {
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (clerkKey) {
    const { userId } = auth();
    if (!userId) throw new Error('Unauthorized');
  }
  return getScannerHealthMetrics();
}
