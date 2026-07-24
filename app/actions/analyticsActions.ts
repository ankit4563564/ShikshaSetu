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
  return getDailyScanMetrics(date);
}

export async function getGateThroughputMetricsAction(date?: string): Promise<GateThroughputMetrics> {
  return getGateThroughputMetrics(date);
}

export async function getScannerHealthMetricsAction(): Promise<ScannerHealthMetrics[]> {
  return getScannerHealthMetrics();
}
