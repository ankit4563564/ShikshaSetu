'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.WORRY_JAR_ENCRYPTION_KEY || 'fallback-key-32-characters-long!!'; // Must be 32 chars

if (!process.env.WORRY_JAR_ENCRYPTION_KEY) {
  console.warn('[Worry Jar] WARNING: Using fallback encryption key. Set WORRY_JAR_ENCRYPTION_KEY in production!');
}

// Encryption utilities
function encryptContent(content: string): { encrypted: string; iv: string; authTag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);
  
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

function decryptContent(encrypted: string, iv: string, authTag: string): string {
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'utf-8'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export interface WorryEntry {
  id: string;
  student_id: string;
  content: string;
  is_shared: boolean;
  shared_at: string | null;
  shared_with_counselor_id: string | null;
  counselor_viewed_at: string | null;
  counselor_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  sentiment?: 'positive' | 'neutral' | 'concerned' | 'urgent';
  tags?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

interface EncryptedWorryEntry {
  encrypted: string;
  iv: string;
  authTag: string;
}

// Create a new worry entry
export async function createWorryEntryAction(
  studentId: string,
  content: string,
  tags?: string[]
): Promise<{ success: boolean; error?: string; worryId?: string }> {
  try {
    const supabase = createClient();

    // Encrypt the content
    const { encrypted, iv, authTag } = encryptContent(content);
    
    // Store encrypted data as JSON in content field
    const encryptedData: EncryptedWorryEntry = { encrypted, iv, authTag };

    const { data, error } = await supabase
      .from('worry_entries')
      .insert({
        student_id: studentId,
        content: JSON.stringify(encryptedData),
        is_shared: false,
        tags: tags || [],
        priority: 'normal',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Worry Jar] Failed to create entry:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/student');
    return { success: true, worryId: data.id };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to save worry entry' };
  }
}

// Get all worry entries for a student
export async function getWorryEntriesAction(
  studentId: string
): Promise<{ success: boolean; entries?: WorryEntry[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('worry_entries')
      .select('*')
      .eq('student_id', studentId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Worry Jar] Failed to fetch entries:', error);
      return { success: false, error: error.message };
    }

    // Decrypt content for each entry
    const decryptedEntries = data.map((entry: any) => {
      try {
        const encryptedData: EncryptedWorryEntry = JSON.parse(entry.content);
        const decryptedContent = decryptContent(
          encryptedData.encrypted,
          encryptedData.iv,
          encryptedData.authTag
        );

        return {
          ...entry,
          content: decryptedContent,
        };
      } catch (decryptError) {
        console.error('[Worry Jar] Failed to decrypt entry:', entry.id, decryptError);
        return {
          ...entry,
          content: '[Content unavailable]',
        };
      }
    });

    return { success: true, entries: decryptedEntries };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to load worry entries' };
  }
}

// Share a worry with counselor
export async function shareWorryWithCounselorAction(
  worryId: string,
  studentId: string,
  counselorId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // If no specific counselor, find class teacher
    let targetCounselorId = counselorId;
    if (!targetCounselorId) {
      const { data: student } = await supabase
        .from('students')
        .select('class_teacher_id')
        .eq('id', studentId)
        .single();
      
      targetCounselorId = student?.class_teacher_id;
    }

    const { error } = await supabase
      .from('worry_entries')
      .update({
        is_shared: true,
        shared_at: new Date().toISOString(),
        shared_with_counselor_id: targetCounselorId,
      })
      .eq('id', worryId)
      .eq('student_id', studentId);

    if (error) {
      console.error('[Worry Jar] Failed to share entry:', error);
      return { success: false, error: error.message };
    }

    // Trigger will automatically create notification for counselor
    revalidatePath('/student');
    revalidatePath('/teacher');
    return { success: true };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to share worry' };
  }
}

// Delete a worry entry (soft delete)
export async function deleteWorryEntryAction(
  worryId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('worry_entries')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', worryId)
      .eq('student_id', studentId);

    if (error) {
      console.error('[Worry Jar] Failed to delete entry:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to delete worry' };
  }
}

// Counselor: View shared worries
export async function getCounselorWorryEntriesAction(
  teacherId: string
): Promise<{ success: boolean; entries?: any[]; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('worry_entries')
      .select(`
        *,
        students (
          id,
          display_name,
          class_name
        )
      `)
      .eq('is_shared', true)
      .or(`shared_with_counselor_id.eq.${teacherId},students.class_teacher_id.eq.${teacherId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Worry Jar] Failed to fetch counselor entries:', error);
      return { success: false, error: error.message };
    }

    // Decrypt content
    const decryptedEntries = data.map((entry: any) => {
      try {
        const encryptedData: EncryptedWorryEntry = JSON.parse(entry.content);
        const decryptedContent = decryptContent(
          encryptedData.encrypted,
          encryptedData.iv,
          encryptedData.authTag
        );

        return {
          ...entry,
          content: decryptedContent,
        };
      } catch (decryptError) {
        console.error('[Worry Jar] Failed to decrypt entry:', entry.id);
        return {
          ...entry,
          content: '[Content unavailable]',
        };
      }
    });

    return { success: true, entries: decryptedEntries };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to load worry entries' };
  }
}

// Counselor: Mark worry as viewed
export async function markWorryViewedAction(
  worryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('worry_entries')
      .update({ counselor_viewed_at: new Date().toISOString() })
      .eq('id', worryId)
      .is('counselor_viewed_at', null);

    if (error) {
      console.error('[Worry Jar] Failed to mark viewed:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/teacher');
    return { success: true };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to mark as viewed' };
  }
}

// Counselor: Respond to worry
export async function respondToWorryAction(
  worryId: string,
  response: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('worry_entries')
      .update({
        counselor_response: response,
        responded_at: new Date().toISOString(),
      })
      .eq('id', worryId);

    if (error) {
      console.error('[Worry Jar] Failed to respond:', error);
      return { success: false, error: error.message };
    }

    // TODO: Create notification for student about counselor response

    revalidatePath('/teacher');
    revalidatePath('/student');
    return { success: true };
  } catch (error) {
    console.error('[Worry Jar] Unexpected error:', error);
    return { success: false, error: 'Failed to send response' };
  }
}

// Migrate localStorage worries to database (one-time migration helper)
export async function migrateLocalStorageWorriesAction(
  studentId: string,
  localWorries: Array<{ content: string; createdAt: Date; isShared: boolean }>
): Promise<{ success: boolean; migrated: number; error?: string }> {
  try {
    const supabase = createClient();
    let migratedCount = 0;

    for (const worry of localWorries) {
      const { encrypted, iv, authTag } = encryptContent(worry.content);
      const encryptedData: EncryptedWorryEntry = { encrypted, iv, authTag };

      const { error } = await supabase
        .from('worry_entries')
        .insert({
          student_id: studentId,
          content: JSON.stringify(encryptedData),
          is_shared: worry.isShared,
          created_at: worry.createdAt.toISOString(),
          tags: [],
          priority: 'normal',
        });

      if (!error) {
        migratedCount++;
      } else {
        console.error('[Worry Jar] Migration failed for entry:', error);
      }
    }

    revalidatePath('/student');
    return { success: true, migrated: migratedCount };
  } catch (error) {
    console.error('[Worry Jar] Migration error:', error);
    return { success: false, migrated: 0, error: 'Migration failed' };
  }
}
