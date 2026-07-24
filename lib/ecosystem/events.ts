import type {
  EcosystemEventInput,
  EcosystemNotificationCategory,
  Portal,
} from '@/types';
import { sendNotification } from '@/lib/notifications/service';

type SupabaseLike = {
  from: (table: string) => any;
};

export interface EcosystemRecipient {
  id: string;
  role: Portal;
}

const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST205', 'PGRST116']);

export async function recordEcosystemEvent(
  supabase: SupabaseLike,
  event: EcosystemEventInput,
) {
  const { error } = await supabase.from('ecosystem_events').insert({
    event_type: event.eventType,
    student_id: event.studentId || null,
    actor_id: event.actorId || null,
    actor_role: event.actorRole || null,
    title: event.title,
    body: event.body || null,
    metadata: event.metadata || {},
  });

  if (error && !MISSING_TABLE_CODES.has(error.code)) {
    console.error('[Ecosystem] Failed to record event:', error.message);
  }
}

export async function createEcosystemNotifications(
  supabase: SupabaseLike,
  recipients: EcosystemRecipient[],
  notification: {
    studentId?: string | null;
    title: string;
    body?: string | null;
    category: EcosystemNotificationCategory;
  },
) {
  const uniqueRecipients = Array.from(
    new Map(recipients.filter((r) => r.id).map((r) => [`${r.role}:${r.id}`, r])).values(),
  );

  if (uniqueRecipients.length === 0) return;

  const categoryMap: Record<string, string> = {
    academic: 'academic',
    wellness: 'wellness',
    safety: 'safety',
    chat: 'chat',
    system: 'system',
  };

  const mappedCategory = (categoryMap[notification.category] || 'system') as any;
  const isSafety = notification.category === 'safety';

  const result = await sendNotification({
    title: notification.title,
    body: notification.body || undefined,
    category: mappedCategory,
    priority: isSafety ? 'high' : 'normal',
    channels: ['in_app'],
    recipientIds: uniqueRecipients.map(r => r.id),
    recipientRoles: uniqueRecipients.map(r => r.role),
    studentId: notification.studentId || undefined,
  });

  if (!result.success) {
    console.warn('[Ecosystem] Unified notification failed, using direct insert:', result.error);

    const directInsert = uniqueRecipients.map((recipient) => ({
      recipient_id: recipient.id,
      recipient_role: recipient.role,
      student_id: notification.studentId || null,
      title: notification.title,
      body: notification.body || null,
      category: notification.category,
      is_read: false,
    }));

    const { error } = await supabase.from('notifications').insert(directInsert);
    if (error) {
      console.error('[Ecosystem] Direct notification insert also failed:', error.message);
    }
  }
}

export async function getStudentCareTeamRecipients(
  supabase: SupabaseLike,
  studentId: string,
  options: {
    includeGuardians?: boolean;
    includeTeacher?: boolean;
    includeAdmins?: boolean;
  } = {},
): Promise<EcosystemRecipient[]> {
  const recipients: EcosystemRecipient[] = [];
  const includeGuardians = options.includeGuardians ?? true;
  const includeTeacher = options.includeTeacher ?? true;
  const includeAdmins = options.includeAdmins ?? false;

  if (includeGuardians) {
    const { data: guardianAccess, error } = await supabase
      .from('guardian_access')
      .select('guardian_id')
      .eq('student_id', studentId);

    if (error) {
      console.error('[Ecosystem] Failed to load guardians:', error.message);
    } else {
      recipients.push(
        ...(guardianAccess || []).map((row: any) => ({
          id: row.guardian_id,
          role: 'parent' as const,
        })),
      );
    }
  }

  if (includeTeacher) {
    const { data: student, error } = await supabase
      .from('students')
      .select('class_teacher_id')
      .eq('id', studentId)
      .maybeSingle();

    if (error) {
      console.error('[Ecosystem] Failed to load class teacher:', error.message);
    } else if (student?.class_teacher_id) {
      recipients.push({ id: student.class_teacher_id, role: 'teacher' });
    }
  }

  if (includeAdmins) {
    const { data: admins, error } = await supabase.from('admins').select('id');

    if (error && !MISSING_TABLE_CODES.has(error.code)) {
      console.error('[Ecosystem] Failed to load admins:', error.message);
    } else {
      recipients.push(
        ...(admins || []).map((row: any) => ({
          id: row.id,
          role: 'admin' as const,
        })),
      );
    }
  }

  return recipients;
}
