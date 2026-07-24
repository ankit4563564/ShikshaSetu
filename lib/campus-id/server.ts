/**
 * Server-only Campus ID exports.
 * These modules use next/headers or supabase server client
 * and must NOT be imported from client components.
 */

export { processScan, registerScanHandler } from './scanHandler';
export { initializeCampusIdSystem } from './init';

// Re-export server-safe card operations
export { issueCard, revokeCard, updateCardStatus, getStudentProfile } from './campusCard';
export { generateAndStoreToken, getActiveTokenForCard, generateQrContentForCard } from './qrToken';
export { recordEcosystemEvent, createEcosystemNotifications, getStudentCareTeamRecipients } from '@/lib/ecosystem';

// Device authentication
export { validateDevice, getDeviceById, getDeviceByPublicIdentifier } from './deviceAuth';

// Analytics
export { getDailyScanMetrics, getGateThroughputMetrics, getScannerHealthMetrics } from './analytics';
