'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export interface DemoNotification {
  recipientId: string;
  recipientRole: 'teacher' | 'parent' | 'student';
  studentId: string;
  title: string;
  body: string;
  category: string;
}

const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    recipientId: 'a1000000-0000-4000-8000-000000000001',
    recipientRole: 'teacher',
    studentId: 'b1000000-0000-4000-8000-000000000001',
    title: 'Aarav has arrived on campus',
    body: 'Aarav Sharma scanned their Campus Pass at the main gate.',
    category: 'attendance',
  },
  {
    recipientId: 'a1000000-0000-4000-8000-000000000001',
    recipientRole: 'teacher',
    studentId: 'b1000000-0000-4000-8000-000000000001',
    title: 'Morning check-in complete',
    body: 'Aarav Sharma is present and marked for the day.',
    category: 'attendance',
  },
  {
    recipientId: 'a1000000-0000-4000-8000-000000000001',
    recipientRole: 'teacher',
    studentId: 'b1000000-0000-4000-8000-000000000001',
    title: 'Aarav boarded the bus',
    body: 'Aarav Sharma has boarded bus KL-05-AB-1234 for the afternoon route.',
    category: 'transport',
  },
  {
    recipientId: 'a1000000-0000-4000-8000-000000000001',
    recipientRole: 'teacher',
    studentId: 'b1000000-0000-4000-8000-000000000001',
    title: 'Aarav deboarded safely',
    body: 'Aarav Sharma deboarded at their scheduled stop.',
    category: 'transport',
  },
  {
    recipientId: 'a1000000-0000-4000-8000-000000000001',
    recipientRole: 'teacher',
    studentId: 'b1000000-0000-4000-8000-000000000001',
    title: 'Home safe confirmed',
    body: 'Aarav Sharma confirmed they are home safe.',
    category: 'safety',
  },
];

export async function generateDemoNotifications(recipientRole?: string): Promise<number> {
  const adminDb = createAdminClient();
  let count = 0;

  const filtered = recipientRole
    ? DEMO_NOTIFICATIONS.filter((n) => n.recipientRole === recipientRole)
    : DEMO_NOTIFICATIONS;

  for (const notif of filtered) {
    const { error } = await adminDb.from('notifications').insert({
      recipient_id: notif.recipientId,
      recipient_role: notif.recipientRole,
      student_id: notif.studentId,
      title: notif.title,
      body: notif.body,
      category: notif.category,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    if (!error) count++;
  }

  return count;
}
