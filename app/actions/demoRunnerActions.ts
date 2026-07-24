'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { 
  DEMO_STUDENT_ID, 
  DEMO_STUDENT_NAME, 
  DEMO_TEACHER_ID, 
  DEMO_PARENT_ID, 
  DEMO_VENDOR_ID, 
  DEMO_BUS_IDENTIFIER 
} from '@/lib/demo/demoConstants';
// Access is enforced by the demo runner API route. These actions are only
// reachable through that server-side demo control plane.
const requireRole = async (_roles: readonly string[]) => undefined;

const db = createAdminClient();

const DEMO_SESSION_PREFIX = 'demo_session_';

// Helper to track demo session for cleanup
async function getOrCreateDemoSession(): Promise<string> {
  const sessionId = `${DEMO_SESSION_PREFIX}${Date.now()}`;
  return sessionId;
}

async function ensureDemoCards(): Promise<void> {
  for (const card of [
    { card_type: 'student_id' as const, display_label: 'Student ID Card' },
    { card_type: 'bus_pass' as const, display_label: 'Bus Pass' },
  ]) {
    const { data: existing } = await db.from('campus_cards')
      .select('id')
      .eq('student_id', DEMO_STUDENT_ID)
      .eq('card_type', card.card_type)
      .eq('status', 'active')
      .maybeSingle();

    if (!existing) {
      const { error } = await db.from('campus_cards').insert({
        student_id: DEMO_STUDENT_ID,
        card_type: card.card_type,
        status: 'active',
        display_label: card.display_label,
        issued_by: DEMO_TEACHER_ID,
      });
      if (error) throw new Error(`Failed to prepare demo ${card.card_type} card: ${error.message}`);
    }
  }
}

async function getOrCreateDemoTrip(): Promise<{ id: string }> {
  const { data: trip, error: tripError } = await db.from('driver_trips')
    .select('id')
    .eq('bus_identifier', DEMO_BUS_IDENTIFIER)
    .eq('status', 'en_route')
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (tripError) throw new Error(`Failed to load demo trip: ${tripError.message}`);
  if (trip?.id) return trip;

  const { data: newTrip, error: createTripError } = await db.from('driver_trips').insert({
    driver_id: 'd1000000-0000-4000-8000-000000000001',
    bus_identifier: DEMO_BUS_IDENTIFIER,
    status: 'en_route',
    started_at: new Date().toISOString(),
  }).select('id').single();

  if (createTripError || !newTrip?.id) {
    throw new Error(`Failed to create demo trip: ${createTripError?.message || 'No trip returned'}`);
  }

  return newTrip;
}

async function recordDemoEvent(
  sessionId: string,
  stepId: number,
  stepTitle: string,
  action: string,
  payload: Record<string, any>
): Promise<void> {
  await db.from('ecosystem_events').insert({
    event_type: 'demo_step',
    student_id: DEMO_STUDENT_ID,
    actor_id: 'demo_runner',
    actor_role: 'system',
    title: `[Demo] ${stepTitle}`,
    body: action,
    metadata: { session_id: sessionId, step_id: stepId, ...payload },
  });
}

// ── Step 1: Student arrives - Gate QR Scan ──────────────────────────────────
export async function demoStep1GateEntry(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Get the student's campus card
    const { data: card } = await db.from('campus_cards')
      .select('id, student_id').eq('student_id', DEMO_STUDENT_ID).eq('status', 'active').eq('card_type', 'student_id').maybeSingle();

    if (!card) {
      return { success: false, error: 'No active campus card found for demo student' };
    }

    // Create a QR token for this scan
    const nonce = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { data: qrToken, error: qrError } = await db.from('qr_tokens').insert({
      card_id: card.id,
      nonce,
      expires_at: expiresAt,
    }).select('id, nonce').single();

    if (qrError || !qrToken) {
      return { success: false, error: qrError?.message || 'Failed to create QR token' };
    }

    // Record the gate entry scan event
    const { error: scanError } = await db.from('scan_events').insert({
      qr_token_id: qrToken.id,
      card_id: card.id,
      student_id: DEMO_STUDENT_ID,
      mode: 'gate_entry',
      result: 'success',
      scanner_portal: 'gate',
      scanner_identity: 'gate_kiosk_main',
      device_metadata: { demo: true, kiosk: 'main_gate' },
    });

    if (scanError) {
      return { success: false, error: scanError.message };
    }

    // Mark QR token as consumed
    await db.from('qr_tokens').update({ consumed_at: new Date().toISOString() }).eq('id', qrToken.id);

    // Emit ecosystem event
    await recordDemoEvent(sessionId, 1, 'Student Arrives', 'gate_qr_scan', {
      student_name: DEMO_STUDENT_NAME,
      card_id: card.id,
      qr_token_id: qrToken.id,
      portal: 'gate',
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 2: Attendance Marked ────────────────────────────────────────────────
export async function demoStep2Attendance(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    const today = new Date().toISOString().split('T')[0];

    // Insert attendance record
    const { error: attError } = await db.from('attendance').upsert({
      student_id: DEMO_STUDENT_ID,
      date: today,
      status: 'present',
      marked_by: DEMO_TEACHER_ID,
      notes: 'Demo: Auto-marked present via gate entry',
    }, { onConflict: 'student_id,date' });

    if (attError) {
      return { success: false, error: attError.message };
    }

    // Create notification for teacher
    await db.from('notifications').insert({
      recipient_id: DEMO_TEACHER_ID,
      recipient_role: 'teacher',
      student_id: DEMO_STUDENT_ID,
      title: 'Student Present',
      body: `${DEMO_STUDENT_NAME} has been marked present (auto via gate entry)`,
      category: 'attendance',
      is_read: false,
    });

    // Create notification for parent
    await db.from('notifications').insert({
      recipient_id: DEMO_PARENT_ID,
      recipient_role: 'parent',
      student_id: DEMO_STUDENT_ID,
      title: 'Attendance Confirmed',
      body: `${DEMO_STUDENT_NAME} has arrived at school and is marked present.`,
      category: 'attendance',
      is_read: false,
    });

    // Emit ecosystem event
    await recordDemoEvent(sessionId, 2, 'Attendance Recorded', 'attendance_marked', {
      student_name: DEMO_STUDENT_NAME,
      date: today,
      status: 'present',
      teacher_id: DEMO_TEACHER_ID,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 3: Teacher Dashboard Updates ────────────────────────────────────────
export async function demoStep3TeacherDashboard(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Create ecosystem event for teacher dashboard
    await db.from('ecosystem_events').insert({
      event_type: 'demo_teacher_update',
      student_id: DEMO_STUDENT_ID,
      actor_id: DEMO_TEACHER_ID,
      actor_role: 'teacher',
      title: 'Live Dashboard Update',
      body: `${DEMO_STUDENT_NAME} marked present - class roster updated`,
      metadata: { demo: true, source: 'attendance' },
    });

    // Create the trip before creating the journey. student_journey.trip_id is NOT NULL.
    const trip = await getOrCreateDemoTrip();
    const { error: journeyError } = await db.from('student_journey').upsert({
      student_id: DEMO_STUDENT_ID,
      trip_id: trip.id,
      status: 'waiting',
    }, { onConflict: 'student_id,trip_id' });
    if (journeyError) throw new Error(`Failed to initialize demo journey: ${journeyError.message}`);

    await recordDemoEvent(sessionId, 3, 'Teacher Dashboard Updated', 'teacher_dashboard_update', {
      student_name: DEMO_STUDENT_NAME,
      update_type: 'attendance_sync',
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 4: Parent Notified (already done in step 2, but add more) ──────────
export async function demoStep4ParentNotified(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    await db.from('notifications').insert({
      recipient_id: DEMO_PARENT_ID,
      recipient_role: 'parent',
      student_id: DEMO_STUDENT_ID,
      title: 'Real-time Update',
      body: `${DEMO_STUDENT_NAME} is in class. Tap to view live dashboard.`,
      category: 'attendance',
      is_read: false,
    });

    await recordDemoEvent(sessionId, 4, 'Parent Notified', 'parent_notification', {
      student_name: DEMO_STUDENT_NAME,
      notification_type: 'attendance_confirmation',
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 5: Bus Boarding ─────────────────────────────────────────────────────
export async function demoStep5BusBoarding(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Get active trip for this bus
    const { data: trip } = await db.from('driver_trips')
      .select('id').eq('bus_identifier', DEMO_BUS_IDENTIFIER).eq('status', 'en_route')
      .order('started_at', { ascending: false }).limit(1).maybeSingle();

    let activeTrip = trip;
    if (!trip) {
      // Create a demo trip
      activeTrip = await getOrCreateDemoTrip();

      // Update student journey to boarded
      const { error: journeyError } = await db.from('student_journey').upsert({
        student_id: DEMO_STUDENT_ID,
        trip_id: activeTrip.id,
        status: 'boarded',
        boarded_at: new Date().toISOString(),
      }, { onConflict: 'student_id,trip_id' });
      if (journeyError) throw new Error(`Failed to record bus boarding: ${journeyError.message}`);

      // Create boarding scan event
      const { data: card } = await db.from('campus_cards')
        .select('id').eq('student_id', DEMO_STUDENT_ID).eq('status', 'active').eq('card_type', 'bus_pass').maybeSingle();

      if (card) {
        await db.from('scan_events').insert({
          card_id: card.id,
          student_id: DEMO_STUDENT_ID,
          mode: 'transport_board',
          result: 'success',
          scanner_portal: 'driver',
          scanner_identity: 'driver_app_demo',
          device_metadata: { demo: true, bus: DEMO_BUS_IDENTIFIER },
        });
      }

      // Notify teacher and parent
      await db.from('notifications').insert([
        {
          recipient_id: DEMO_TEACHER_ID,
          recipient_role: 'teacher',
          student_id: DEMO_STUDENT_ID,
          title: 'Student Boarded Bus',
          body: `${DEMO_STUDENT_NAME} has boarded ${DEMO_BUS_IDENTIFIER}`,
          category: 'transport',
          is_read: false,
        },
        {
          recipient_id: DEMO_PARENT_ID,
          recipient_role: 'parent',
          student_id: DEMO_STUDENT_ID,
          title: 'Bus Boarding Confirmed',
          body: `${DEMO_STUDENT_NAME} has safely boarded the bus. Track the journey live.`,
          category: 'transport',
          is_read: false,
        }
      ]);
    } else {
      // Update existing trip
      const { error: journeyError } = await db.from('student_journey').upsert({
        student_id: DEMO_STUDENT_ID,
        trip_id: trip.id,
        status: 'boarded',
        boarded_at: new Date().toISOString(),
      }, { onConflict: 'student_id,trip_id' });
      if (journeyError) throw new Error(`Failed to record bus boarding: ${journeyError.message}`);
    }

    await recordDemoEvent(sessionId, 5, 'Bus Boarding', 'transport_board', {
      student_name: DEMO_STUDENT_NAME,
      bus_identifier: DEMO_BUS_IDENTIFIER,
      trip_id: activeTrip?.id,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 6: Parent Notification (Bus Boarding) ──────────────────────────────
export async function demoStep6ParentBusNotified(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    await db.from('notifications').insert({
      recipient_id: DEMO_PARENT_ID,
      recipient_role: 'parent',
      student_id: DEMO_STUDENT_ID,
      title: 'Bus Tracking Active',
      body: `You can now track ${DEMO_STUDENT_NAME}'s bus journey in real-time.`,
      category: 'transport',
      is_read: false,
    });

    await recordDemoEvent(sessionId, 6, 'Parent: Bus Tracking', 'parent_notification', {
      student_name: DEMO_STUDENT_NAME,
      notification_type: 'bus_tracking',
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 7: Homework Assigned ────────────────────────────────────────────────
export async function demoStep7HomeworkAssigned(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    await db.from('homework').insert({
      student_id: DEMO_STUDENT_ID,
      subject: 'Mathematics',
      title: 'Chapter 5: Algebraic Expressions',
      description: 'Complete exercises 5.1 to 5.5 from the textbook. Submit before class tomorrow.',
      due_date: dueDateStr,
      assigned_by: DEMO_TEACHER_ID,
    });

    // Notify parent
    await db.from('notifications').insert({
      recipient_id: DEMO_PARENT_ID,
      recipient_role: 'parent',
      student_id: DEMO_STUDENT_ID,
      title: 'New Homework Assigned',
      body: `${DEMO_STUDENT_NAME} has new Math homework due tomorrow.`,
      category: 'academic',
      is_read: false,
    });

    await recordDemoEvent(sessionId, 7, 'Homework Assigned', 'homework_created', {
      student_name: DEMO_STUDENT_NAME,
      subject: 'Mathematics',
      due_date: dueDateStr,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 8: Teacher Awards Campus Coins ──────────────────────────────────────
export async function demoStep8AwardCoins(sessionId: string): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  await requireRole(['admin']);
  try {
    const result = await db.rpc('earn_coins', {
      p_student_id: DEMO_STUDENT_ID,
      p_amount: 25,
      p_tx_type: 'earn_behaviour',
      p_description: 'Excellent participation in class discussion',
      p_created_by: DEMO_TEACHER_ID,
    });

    const data = result.data as any;
    if (!data?.success) {
      return { success: false, error: data?.error || 'Failed to award coins' };
    }

    // Notify parent
    await db.from('notifications').insert({
      recipient_id: DEMO_PARENT_ID,
      recipient_role: 'parent',
      student_id: DEMO_STUDENT_ID,
      title: 'Campus Coins Earned!',
      body: `${DEMO_STUDENT_NAME} earned 25 coins for excellent class participation.`,
      category: 'academic',
      is_read: false,
    });

    await recordDemoEvent(sessionId, 8, 'Campus Coins Awarded', 'coins_earned', {
      student_name: DEMO_STUDENT_NAME,
      amount: 25,
      reason: 'Excellent class participation',
      new_balance: data.new_balance,
    });

    return { success: true, newBalance: data.new_balance };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 9: Student Redeems Reward ───────────────────────────────────────────
export async function demoStep9RedeemReward(sessionId: string): Promise<{ success: boolean; error?: string; token?: string; redemptionId?: string }> {
  await requireRole(['admin']);
  try {
    const token = crypto.randomUUID();
    const qrData = JSON.stringify({ v: 1, t: token, s: DEMO_STUDENT_ID, r: 'e1000000-0000-4000-8000-000000000001' }); // Free Canteen Meal

    const result = await db.rpc('redeem_reward_with_token', {
      p_student_id: DEMO_STUDENT_ID,
      p_reward_id: 'e1000000-0000-4000-8000-000000000001', // Free Canteen Meal
      p_token: token,
      p_qr_data: qrData,
    });

    const data = result.data as any;
    if (!data?.success) {
      return { success: false, error: data?.error || 'Redemption failed' };
    }

    await recordDemoEvent(sessionId, 9, 'Reward Redeemed', 'reward_redeemed', {
      student_name: DEMO_STUDENT_NAME,
      reward_name: 'Free Canteen Meal',
      cost: 50,
      new_balance: data.new_balance,
      token: data.token,
      redemption_id: data.redemption_id,
    });

    return { success: true, token: data.token, redemptionId: data.redemption_id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 10: QR Generated ────────────────────────────────────────────────────
export async function demoStep10QRGenerated(sessionId: string, redemptionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    if (!redemptionId) {
      return { success: false, error: 'No redemption ID provided' };
    }

    // The QR token was already created in redeem_reward_with_token
    // Just verify it exists
    const { data: token } = await db.from('redemption_tokens')
      .select('id, token, qr_data, expires_at, status')
      .eq('redemption_id', redemptionId)
      .maybeSingle();

    if (!token) {
      return { success: false, error: 'QR token not found' };
    }

    await recordDemoEvent(sessionId, 10, 'QR Code Generated', 'qr_generated', {
      student_name: DEMO_STUDENT_NAME,
      token: token.token,
      expires_at: token.expires_at,
      qr_data: token.qr_data,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 11: Vendor Scans QR ────────────────────────────────────────────────
export async function demoStep11VendorScan(sessionId: string, redemptionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    if (!redemptionId) {
      return { success: false, error: 'No redemption ID provided' };
    }

    // Get the token for this redemption
    const { data: tokenData } = await db.from('redemption_tokens')
      .select('token').eq('redemption_id', redemptionId).maybeSingle();

    if (!tokenData) {
      return { success: false, error: 'No token found for redemption' };
    }

    // Vendor scans the token
    const result = await db.rpc('vendor_scan_token', {
      p_token: tokenData.token,
      p_vendor_id: DEMO_VENDOR_ID,
    });

    const data = result.data as any;
    if (!data?.success) {
      return { success: false, error: data?.error || 'Vendor scan failed' };
    }

    // Update rewards_config stock
    const { data: rewardData } = await db.from('rewards_config')
      .select('stock')
      .eq('id', 'e1000000-0000-4000-8000-000000000001')
      .maybeSingle();
    const currentStock = (rewardData as any)?.stock || 0;
    await db.from('rewards_config')
      .update({ stock: Math.max(0, currentStock - 1) })
      .eq('id', 'e1000000-0000-4000-8000-000000000001');

    // Emit ecosystem event
    await recordDemoEvent(sessionId, 11, 'Vendor Scans QR', 'vendor_scan', {
      student_name: DEMO_STUDENT_NAME,
      vendor_id: DEMO_VENDOR_ID,
      reward_name: data.reward_name,
      token: tokenData.token,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 12: Inventory Updates ───────────────────────────────────────────────
export async function demoStep12InventoryUpdate(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Create inventory log
    await db.from('inventory_logs').insert({
      reward_id: 'e1000000-0000-4000-8000-000000000001',
      change_type: 'redeem',
      quantity: -1,
      notes: 'Demo: Free Canteen Meal redeemed by Aarav Sharma',
    });

    await recordDemoEvent(sessionId, 12, 'Inventory Updated', 'inventory_update', {
      reward_name: 'Free Canteen Meal',
      stock_change: -1,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 13: Analytics Update ────────────────────────────────────────────────
export async function demoStep13AnalyticsUpdate(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    await db.from('ecosystem_events').insert({
      event_type: 'demo_analytics_update',
      student_id: DEMO_STUDENT_ID,
      actor_id: 'demo_runner',
      actor_role: 'system',
      title: 'Analytics Dashboard Refreshed',
      body: 'Live metrics updated across all portals',
      metadata: {
        demo: true,
        metrics: {
          attendance_rate: '96.2%',
          coins_circulating: '15,420',
          rewards_redeemed_today: 47,
          active_students: 234,
        },
      },
    });

    await recordDemoEvent(sessionId, 13, 'Analytics Updated', 'analytics_refresh', {
      student_name: DEMO_STUDENT_NAME,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 14: Student Deboards ────────────────────────────────────────────────
export async function demoStep14Deboard(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Get active trip
    const { data: journey } = await db.from('student_journey')
      .select('trip_id').eq('student_id', DEMO_STUDENT_ID)
      .in('status', ['boarded', 'waiting'])
      .order('boarded_at', { ascending: false }).limit(1).maybeSingle();

    if (!journey) {
      return { success: false, error: 'No active journey found' };
    }

    // Update journey to deboarded
    await db.from('student_journey').update({
      status: 'deboarded',
      deboarded_at: new Date().toISOString(),
      deboard_stop: 'Green Park',
      deboard_lat: 28.5588,
      deboard_lng: 77.2028,
    }).eq('student_id', DEMO_STUDENT_ID).eq('trip_id', journey.trip_id);

    // Create scan event
    const { data: card } = await db.from('campus_cards')
      .select('id').eq('student_id', DEMO_STUDENT_ID).eq('status', 'active').eq('card_type', 'bus_pass').maybeSingle();

    if (card) {
      await db.from('scan_events').insert({
        card_id: card.id,
        student_id: DEMO_STUDENT_ID,
        mode: 'transport_deboard',
        result: 'success',
        scanner_portal: 'driver',
        scanner_identity: 'driver_app_demo',
        device_metadata: { demo: true, stop: 'Green Park' },
      });
    }

    // Notify parent and teacher
    await db.from('notifications').insert([
      {
        recipient_id: DEMO_PARENT_ID,
        recipient_role: 'parent',
        student_id: DEMO_STUDENT_ID,
        title: 'Student Deboard Confirmed',
        body: `${DEMO_STUDENT_NAME} has safely deboarded at Green Park stop.`,
        category: 'transport',
        is_read: false,
      },
      {
        recipient_id: DEMO_TEACHER_ID,
        recipient_role: 'teacher',
        student_id: DEMO_STUDENT_ID,
        title: 'Student Deboarded',
        body: `${DEMO_STUDENT_NAME} deboarded at Green Park.`,
        category: 'transport',
        is_read: false,
      }
    ]);

    await recordDemoEvent(sessionId, 14, 'Student Deboards', 'transport_deboard', {
      student_name: DEMO_STUDENT_NAME,
      stop: 'Green Park',
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Step 15: Home Safe Confirmed ────────────────────────────────────────────
export async function demoStep15HomeSafe(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Get active trip
    const { data: journey } = await db.from('student_journey')
      .select('trip_id').eq('student_id', DEMO_STUDENT_ID)
      .in('status', ['boarded', 'deboarded'])
      .order('boarded_at', { ascending: false }).limit(1).maybeSingle();

    if (journey) {
      await db.from('student_journey').update({
        status: 'home_safe',
        home_safe_at: new Date().toISOString(),
        confirmed_by: DEMO_PARENT_ID,
      }).eq('student_id', DEMO_STUDENT_ID).eq('trip_id', journey.trip_id);
    }

    // Notify all stakeholders
    await db.from('notifications').insert([
      {
        recipient_id: DEMO_TEACHER_ID,
        recipient_role: 'teacher',
        student_id: DEMO_STUDENT_ID,
        title: 'Home Safe Confirmed',
        body: `${DEMO_STUDENT_NAME} has confirmed they are home safe.`,
        category: 'safety',
        is_read: false,
      },
      {
        recipient_id: DEMO_PARENT_ID,
        recipient_role: 'parent',
        student_id: DEMO_STUDENT_ID,
        title: 'Journey Complete',
        body: `${DEMO_STUDENT_NAME} is home safe. Have a great evening!`,
        category: 'safety',
        is_read: false,
      }
    ]);

    await recordDemoEvent(sessionId, 15, 'Home Safe Confirmed', 'home_safe', {
      student_name: DEMO_STUDENT_NAME,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Demo Session Management ─────────────────────────────────────────────────
export async function createDemoSession(): Promise<{ sessionId: string }> {
  await requireRole(['admin']);
  await ensureDemoCards();
  const sessionId = await getOrCreateDemoSession();
  return { sessionId };
}

export async function cleanupDemoData(sessionId: string): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Clean up demo data - delete scan events, notifications, etc. from this session
    await db.from('ecosystem_events')
      .delete()
      .eq('metadata->>session_id', sessionId);

    // Also clean up any scan events from demo
    await db.from('scan_events')
      .delete()
      .like('scanner_identity', '%demo%');

    // Clean up demo notifications
    await db.from('notifications')
      .delete()
      .like('body', '%Demo:%');

    // Clean up demo attendance
    await db.from('attendance')
      .delete()
      .like('notes', '%Demo:%');

    // Clean up demo homework
    await db.from('homework')
      .delete()
      .like('description', '%Demo:%');

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function resetDemoStudent(): Promise<{ success: boolean; error?: string }> {
  await requireRole(['admin']);
  try {
    // Reset student journey
    await db.from('student_journey').delete().eq('student_id', DEMO_STUDENT_ID);
    
    // Reset coin balance to initial
    await db.from('student_balance').upsert({
      student_id: DEMO_STUDENT_ID,
      balance: 100,
      lifetime_earned: 120,
      lifetime_spent: 0,
    });

    // Clear demo coin transactions
    await db.from('coin_transactions')
      .delete()
      .like('description', '%Demo:%');

    // Clear demo redemptions
    await db.from('redemptions')
      .delete()
      .in('student_id', [DEMO_STUDENT_ID]);

    // Clear demo scan events
    await db.from('scan_events')
      .delete()
      .eq('student_id', DEMO_STUDENT_ID)
      .like('scanner_identity', '%demo%');

    // Clear demo notifications
    await db.from('notifications')
      .delete()
      .eq('student_id', DEMO_STUDENT_ID)
      .like('body', '%Demo:%');

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
