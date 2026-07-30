# Protected Workflows Dependency Map

**Purpose:** Document exact files/functions responsible for each protected workflow before making any modifications.

---

## GATE PASS WORKFLOW

### Files
- **Server Action:** `app/actions/gatePassActions.ts`
- **Database Table:** `gate_passes` (migration 003)
- **Audit Table:** `gate_pass_audit_logs` (migration 006)

### Functions
- `requestGatePassAction()` - Parent requests gate pass
- `approveGatePassAction()` - Teacher approves
- `rejectGatePassAction()` - Teacher rejects
- `cancelGatePassAction()` - Parent cancels
- `verifyGatePassAction()` - Gate staff scans

### Data Flow
```
UI (Parent Portal)
→ requestGatePassAction()
→ INSERT gate_passes (status: pending)
→ INSERT gate_pass_audit_logs (action: request)
→ INSERT notifications (to teacher)
→ revalidatePath('/parent', '/teacher')
```

### Cross-Portal Effects
- Teacher receives notification
- Gate staff can verify with QR code
- Bus roster updated on gate pass use
- Ecosystem event recorded

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## MESSAGING WORKFLOW

### Files
- **Server Action:** `app/actions/chatActions.ts`
- **Database Table:** `chat_messages` (migration 003)
- **Trigger:** `fn_validate_chat_sender()` (validates sender_id exists in correct table)

### Functions
- `fetchChatMessagesAction(studentId)` - Fetch message history
- `sendChatMessageAction(data)` - Send message

### Data Flow
```
UI (Teacher/Parent Portal)
→ sendChatMessageAction()
→ INSERT chat_messages
→ recordEcosystemEvent()
→ revalidatePath('/parent', '/teacher')
```

### Cross-Portal Effects
- Real-time via postgres_changes (NotificationContext.tsx)
- Both teacher and parent receive notifications

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## WELLNESS WORKFLOW

### Files
- **Server Action:** `app/actions/wellnessActions.ts`
- **Database Table:** `mood_checkins` (migration 002)

### Functions
- `submitMoodCheckin(studentId, moodValue, note)` - Parent submits mood
- `getTeacherWellnessMetricsAction()` - Admin views teacher wellness
- `studentConfirmHomeSafeAction()` - Student confirms arrival

### Data Flow
```
UI (Parent Portal)
→ submitMoodCheckin()
→ INSERT mood_checkins
→ recordEcosystemEvent()
→ createEcosystemNotifications() (to teacher if mood <= 2)
→ revalidatePath('/parent', '/teacher', '/student', '/admin')
```

### Cross-Portal Effects
- Teacher sees mood in student profile
- Rules engine uses mood for status calculation
- Low mood triggers admin notifications

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## ATTENDANCE WORKFLOW

### Files
- **Database Table:** `attendance` (migration 002)
- **Demo Action:** `app/actions/demoRunnerActions.ts` - `demoStep2Attendance()`
- **Note:** NO dedicated `markAttendanceAction` for main portals

### Current Implementation
- Attendance is marked via demo runner for `/demo` page
- No direct teacher portal action for marking attendance
- Attendance data is READ by portals but not WRITTEN via dedicated action

### Data Flow (Demo)
```
UI (Demo Runner)
→ demoStep2Attendance()
→ INSERT attendance (status: present)
→ INSERT notifications (to student, parent)
→ recordDemoEvent()
→ revalidatePath('/teacher', '/parent')
```

### Status: ⚠️ PARTIAL - Demo-only write, no dedicated portal action

---

## HOMEWORK WORKFLOW

### Files
- **Database Table:** `homework` (migration 002)
- **Demo Action:** `app/actions/demoRunnerActions.ts` - `demoStep7HomeworkAssigned()`
- **Reset Action:** `app/actions/demoResetActions.ts` - updates homework dates
- **Note:** NO dedicated `submitHomeworkAction` for main portals

### Current Implementation
- Homework is assigned via demo runner
- Homework dates are updated via reset action for demo
- No direct student portal action for submitting homework
- Homework data is READ by portals but not WRITTEN via dedicated action

### Data Flow (Demo)
```
UI (Demo Runner)
→ demoStep7HomeworkAssigned()
→ INSERT homework
→ INSERT notifications (to parent)
→ recordDemoEvent()
→ revalidatePath('/teacher', '/parent')
```

### Data Flow (Reset)
```
UI (Connected Demo - Reset)
→ resetDemoDataAction()
→ UPDATE homework (due_date, submitted_at)
→ DELETE interventions, tasks, events
→ UPDATE status_flags
→ revalidatePath('/teacher', '/parent', '/student', '/admin', '/demo/connected')
```

### Status: ⚠️ PARTIAL - Demo-only write, no dedicated portal action

---

## CONNECTED SUPPORT DEMO WORKFLOW

### Files
- **Component:** `components/demo/ConnectedExperienceCenter.tsx`
- **Server Action:** `app/actions/interventionActions.ts`
- **Database Tables:** 
  - `interventions` (migration 005)
  - `intervention_milestones` (migration 005)
  - `student_tasks` (migration 005)
  - `ecosystem_events` (migration 005)
  - `status_flags` (migration 003)
  - `notifications` (migration 003)

### Functions
- `approveSupportPlanAction()` - Teacher approves support plan
- `completeTaskAction()` - Student completes task
- `resetDemoDataAction()` - Reset demo state

### Data Flow (Approval)
```
UI (Connected Demo - Teacher Decision)
→ handleApprove()
→ approveSupportPlanAction()
→ INSERT interventions
→ INSERT intervention_milestones (teacher approval)
→ INSERT student_tasks (from first recommended action)
→ INSERT intervention_milestones (task assignment)
→ INSERT notifications (to parent)
→ recordEcosystemEvent()
→ UPDATE status_flags (action_status: action_taken)
→ revalidatePath('/teacher', '/parent', '/student', '/admin')
```

### Data Flow (Completion)
```
UI (Connected Demo - Student Action)
→ handleComplete()
→ completeTaskAction()
→ UPDATE student_tasks (status: completed, completed_at)
→ INSERT intervention_milestones (task completion)
→ recordEcosystemEvent()
→ revalidatePath('/teacher', '/student', '/admin')
```

### Cross-Portal Effects
- Parent receives notification of support plan
- Student sees assigned task
- Teacher sees intervention in progress
- Admin sees ecosystem event
- Status flag updated

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## TEACHER → PARENT NOTIFICATION WORKFLOW

### Files
- **Server Action:** `app/actions/interventionActions.ts` (line 132-146)
- **Database Table:** `notifications` (migration 003)

### Implementation
```typescript
// Get guardian ID for notification
const { data: guardianAccess, error: guardianError } = await supabase
  .from('guardian_access')
  .select('guardian_id')
  .eq('student_id', input.studentId)
  .eq('is_primary', true)
  .single();

if (!guardianError && guardianAccess) {
  const { error: parentNotifError } = await supabase
    .from('notifications')
    .insert({
      recipient_id: guardianAccess.guardian_id,
      recipient_role: 'parent',
      student_id: input.studentId,
      title: 'Support plan created',
      body: `A support plan has been created for ${input.studentName}. Task: ${primaryAction.action}`,
      category: 'academic',
      is_read: false,
    });
}
```

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## TEACHER → STUDENT TASK ASSIGNMENT WORKFLOW

### Files
- **Server Action:** `app/actions/interventionActions.ts` (line 90-107)
- **Database Table:** `student_tasks` (migration 005)

### Implementation
```typescript
const primaryAction = input.recommendedActions.find(a => a.category === 'academic') || input.recommendedActions[0];

const { data: task, error: taskError } = await supabase
  .from('student_tasks')
  .insert({
    student_id: input.studentId,
    intervention_id: intervention.id,
    title: primaryAction.action,
    description: primaryAction.description,
    category: primaryAction.category as any,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
  })
  .select()
  .single();
```

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## STUDENT TASK COMPLETION WORKFLOW

### Files
- **Server Action:** `app/actions/interventionActions.ts` (line 220-285)
- **Database Table:** `student_tasks` (migration 005)
- **Database Table:** `intervention_milestones` (migration 005)

### Implementation
```typescript
const { data: task, error: taskError } = await supabase
  .from('student_tasks')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
  .eq('id', input.taskId)
  .eq('student_id', input.studentId)
  .select()
  .single();

if (task.intervention_id) {
  const { error: milestoneError } = await supabase
    .from('intervention_milestones')
    .insert({
      intervention_id: task.intervention_id,
      title: `Task completed: ${task.title}`,
      description: task.description,
      status: 'completed',
      actor: 'student',
      actor_id: input.studentId,
      completed_at: new Date().toISOString(),
    });
}
```

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## OUTCOME TRACKING WORKFLOW

### Files
- **Server Action:** `app/actions/interventionActions.ts`
- **Server Action:** `app/actions/ecosystemActions.ts`
- **Database Tables:** 
  - `intervention_milestones` (migration 005)
  - `ecosystem_events` (migration 005)

### Implementation
- Milestones created for each intervention step (approval, task assignment, completion)
- Ecosystem events recorded for cross-portal observability

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## RESET DEMO WORKFLOW

### Files
- **Server Action:** `app/actions/demoResetActions.ts`
- **Canonical IDs:** `lib/canonical/index.ts`

### Implementation
```typescript
// Delete interventions for canonical student
await supabase.from('interventions').delete().eq('student_id', CANONICAL_STUDENT_ID);

// Delete intervention milestones
await supabase.from('intervention_milestones').delete().in('intervention_id', ...);

// Delete student tasks
await supabase.from('student_tasks').delete().eq('student_id', CANONICAL_STUDENT_ID);

// Delete ecosystem events
await supabase.from('ecosystem_events').delete().eq('student_id', CANONICAL_STUDENT_ID);

// Reset status flag
await supabase.from('status_flags').update({
  action_status: 'unseen',
  acted_by: null,
  acted_at: null,
  resolved_at: null,
}).eq('student_id', CANONICAL_STUDENT_ID).is('resolved_at', null);

// Refresh homework dates to current
await supabase.from('homework').update({
  due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  submitted_at: null,
  created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
}).eq('student_id', CANONICAL_STUDENT_ID).eq('title', 'Algebra Worksheet B');
```

### Status: ✅ PROTECTED - DO NOT MODIFY

---

## SUMMARY

### Fully Protected (DO NOT MODIFY)
- Gate Pass ✅
- Messaging ✅
- Wellness ✅
- Connected Support Demo ✅
- Teacher → Parent notifications ✅
- Teacher → Student task assignment ✅
- Student task completion ✅
- Outcome tracking ✅
- Reset Demo ✅

### Partial Implementation (Demo-only writes)
- Attendance ⚠️ - No dedicated portal action for marking
- Homework ⚠️ - No dedicated portal action for submitting

### Note
Attendance and Homework are READ by all portals but WRITTEN only through demo runner actions. For the hackathon demo, this is acceptable. For production, dedicated server actions would be needed.
