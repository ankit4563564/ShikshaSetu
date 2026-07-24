import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CampusCardRecord, CampusCardType, CampusCardStatus } from './types';

export async function getActiveCardsForStudent(studentId: string): Promise<CampusCardRecord[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('campus_cards')
    .select('*')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('issued_at', { ascending: false });
  return (data || []) as CampusCardRecord[];
}

export async function getCardById(cardId: string): Promise<CampusCardRecord | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('campus_cards')
    .select('*')
    .eq('id', cardId)
    .maybeSingle();
  return data as CampusCardRecord | null;
}

export async function getCardByStudentAndType(
  studentId: string,
  cardType: CampusCardType,
): Promise<CampusCardRecord | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('campus_cards')
    .select('*')
    .eq('student_id', studentId)
    .eq('card_type', cardType)
    .eq('status', 'active')
    .maybeSingle();
  return data as CampusCardRecord | null;
}

export async function issueCard(
  studentId: string,
  cardType: CampusCardType,
  issuedBy: string,
  displayLabel?: string,
): Promise<CampusCardRecord | null> {
  const adminDb = createAdminClient();

  const { data, error } = await adminDb
    .from('campus_cards')
    .insert({
      student_id: studentId,
      card_type: cardType,
      status: 'active',
      display_label: displayLabel || null,
      issued_by: issuedBy,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[CampusCard] Failed to issue card:', error.message);
    return null;
  }

  await adminDb.from('card_issue_history').insert({
    student_id: studentId,
    card_id: data.id,
    action: 'issued',
    performed_by: issuedBy,
  });

  return data as CampusCardRecord;
}

export async function revokeCard(
  cardId: string,
  reason: string,
  performedBy: string,
): Promise<boolean> {
  const adminDb = createAdminClient();

  const { error } = await adminDb
    .from('campus_cards')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_reason: reason,
    })
    .eq('id', cardId);

  if (error) {
    console.error('[CampusCard] Failed to revoke card:', error.message);
    return false;
  }

  const { data: card } = await adminDb
    .from('campus_cards')
    .select('student_id')
    .eq('id', cardId)
    .single();

  if (card) {
    await adminDb.from('card_issue_history').insert({
      student_id: card.student_id,
      card_id: cardId,
      action: 'revoked',
      performed_by: performedBy,
      reason,
    });
  }

  return true;
}

export async function updateCardStatus(
  cardId: string,
  status: CampusCardStatus,
  reason: string | null,
  performedBy: string,
): Promise<boolean> {
  const adminDb = createAdminClient();

  const updates: Record<string, unknown> = { status };
  if (status === 'revoked') {
    updates.revoked_at = new Date().toISOString();
    updates.revoked_reason = reason;
  }

  const { error } = await adminDb
    .from('campus_cards')
    .update(updates)
    .eq('id', cardId);

  if (error) {
    console.error('[CampusCard] Failed to update card status:', error.message);
    return false;
  }

  const { data: card } = await adminDb
    .from('campus_cards')
    .select('student_id')
    .eq('id', cardId)
    .single();

  if (card) {
    await adminDb.from('card_issue_history').insert({
      student_id: card.student_id,
      card_id: cardId,
      action: status,
      performed_by: performedBy,
      reason,
    });
  }

  return true;
}

export async function getStudentProfile(studentId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('students')
    .select(`
      id,
      display_name,
      grade,
      section,
      roll_number,
      avatar_url,
      house,
      blood_group,
      emergency_contact,
      academic_year,
      bus_stops!student_stops(
        bus_stops!inner(
          stop_name,
          bus_identifier,
          bus_stops_vehicles:vehicles!bus_identifier(
            bus_identifier
          )
        )
      )
    `)
    .eq('id', studentId)
    .maybeSingle();
  return data;
}
