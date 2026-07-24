'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processScan, initializeCampusIdSystem } from '@/lib/campus-id/server';
import { generateAndStoreToken, getActiveTokenForCard } from '@/lib/campus-id/qrToken';
import { getActiveCardsForStudent } from '@/lib/campus-id/campusCard';
import type { ScanMode, ScannerPortal, CampusCardRecord, ScanOutput } from '@/lib/campus-id/types';
import { requireAuth, requireRole } from '@/lib/auth/getUser';

initializeCampusIdSystem();

export async function processScanAction(
  qrContent: string,
  mode: ScanMode,
  deviceMetadata?: Record<string, unknown>,
): Promise<ScanOutput> {
  const user = await requireAuth();
  const scannerIdentity = user.clerkId;
  const scannerPortal: ScannerPortal = 'gate';

  return processScan({
    qrContent,
    mode,
    scannerPortal,
    scannerIdentity,
    deviceMetadata: deviceMetadata || {},
  });
}

export async function processScanWithPortalAction(
  qrContent: string,
  mode: ScanMode,
  portal: ScannerPortal,
  deviceMetadata?: Record<string, unknown>,
): Promise<ScanOutput> {
  const user = await requireAuth();
  const scannerIdentity = user.clerkId;

  return processScan({
    qrContent,
    mode,
    scannerPortal: portal,
    scannerIdentity,
    deviceMetadata: deviceMetadata || {},
  });
}

export async function getStudentCardsAction(studentId: string): Promise<CampusCardRecord[]> {
  await requireAuth();
  return getActiveCardsForStudent(studentId);
}

export async function getStudentCampusIdAction(studentId: string) {
  await requireAuth();
  const cards = await getActiveCardsForStudent(studentId);
  const primaryCard = cards.find((c) => c.cardType === 'student_id') || cards[0];

  let qrContent: string | null = null;
  if (primaryCard) {
    const existing = await getActiveTokenForCard(primaryCard.id);
    if (existing) {
      const { generateQrContentForCard } = await import('@/lib/campus-id/qrToken');
      qrContent = generateQrContentForCard(primaryCard.id);
    } else {
      const result = await generateAndStoreToken(primaryCard.id);
      if (result) qrContent = result.qrContent;
    }
  }

  const guardianName = await getPrimaryGuardianName(studentId);
  const busRoute = await getStudentBusRoute(studentId);

  const supabase = createClient();
  const { data: profile } = await supabase
    .from('students')
    .select('id, display_name, grade, section, roll_number, avatar_url, house')
    .eq('id', studentId)
    .single();

  return {
    profile,
    cards,
    primaryCard,
    qrContent,
    guardianName,
    busRoute,
  };
}

async function getPrimaryGuardianName(studentId: string): Promise<string | null> {
  try {
    const adminDb = createAdminClient();
    const { data } = await adminDb
      .from('guardian_access')
      .select('guardians!inner(first_name, last_name)')
      .eq('student_id', studentId)
      .eq('is_primary', true)
      .limit(1)
      .maybeSingle();

    if (data) {
      const g = data as any;
      return `${g.guardians?.first_name || ''} ${g.guardians?.last_name || ''}`.trim() || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function getStudentBusRoute(studentId: string): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('student_stops')
      .select('bus_stops!inner(bus_identifier, stop_name)')
      .eq('student_id', studentId)
      .limit(1)
      .maybeSingle();

    if (data) {
      const bs = data as any;
      return bs.bus_stops?.bus_identifier || null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function getFullStudentProfileAction(studentId: string) {
  await requireAuth();
  try {
    const supabase = createClient();
    const adminDb = createAdminClient();

    const [profileResult, cardsResult, guardianResult, busRouteResult, medicalResult] = await Promise.all([
      supabase
        .from('students')
        .select('id, display_name, grade, section, roll_number, avatar_url, house, emergency_contact, academic_year')
        .eq('id', studentId)
        .single(),
      supabase
        .from('campus_cards')
        .select('*')
        .eq('student_id', studentId)
        .eq('status', 'active')
        .order('issued_at', { ascending: false }),
      supabase
        .from('guardian_access')
        .select('guardians!inner(first_name, last_name)')
        .eq('student_id', studentId)
        .eq('is_primary', true)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('student_stops')
        .select('bus_stops!inner(bus_identifier, stop_name)')
        .eq('student_id', studentId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from('medical_flags')
        .select('id, flag_type, description, severity, is_active')
        .eq('student_id', studentId)
        .eq('is_active', true),
    ]);

    if (profileResult.error || !profileResult.data) return null;

    const profile = profileResult.data as any;
    const cards = (cardsResult.data || []) as any[];
    const primaryCard = cards.find((c: any) => c.card_type === 'student_id') || cards[0];

    let qrContent: string | null = null;
    if (primaryCard) {
      const existing = await getActiveTokenForCard(primaryCard.id);
      if (existing) {
        const { generateQrContentForCard } = await import('@/lib/campus-id/qrToken');
        qrContent = generateQrContentForCard(primaryCard.id);
      } else {
        const result = await generateAndStoreToken(primaryCard.id);
        if (result) qrContent = result.qrContent;
      }
    }

    const guardianData = guardianResult.data as any;
    const guardianName = guardianData
      ? `${guardianData.guardians?.first_name || ''} ${guardianData.guardians?.last_name || ''}`.trim() || null
      : null;

    const busData = busRouteResult.data as any;
    const busRoute = busData?.bus_stops?.bus_identifier || null;

    const rawFlags = medicalResult.data || [];
    const medicalFlags = rawFlags.map((f: any) => ({
      id: f.id,
      flagType: f.flag_type,
      description: f.description,
      severity: f.severity,
      isActive: f.is_active,
    }));

    return {
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        grade: profile.grade,
        section: profile.section,
        rollNumber: profile.roll_number,
        avatarUrl: profile.avatar_url,
        house: profile.house,
        emergencyContact: profile.emergency_contact,
        academicYear: profile.academic_year,
      },
      cards,
      primaryCard,
      qrContent,
      guardianName,
      busRoute,
      medicalFlags,
    };
  } catch (err) {
    console.error('[CampusID] Failed to fetch full student profile:', err);
    return null;
  }
}
