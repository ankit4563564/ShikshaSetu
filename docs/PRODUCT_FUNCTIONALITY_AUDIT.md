# ShikshaSetu Product Functionality Audit

**Audit Date:** 2026-07-30
**Auditor:** Cascade AI
**Scope:** Full product functionality, data reality, and connected-system audit

---

## FIRST CHECKPOINT: Feature Status Table

| Feature | Status | Data Source | Cross-Portal | Persistence | Evidence |
|---------|--------|-------------|--------------|-------------|----------|
| Attendance | 🔵 DEMO-SIMULATED | Demo universe (schoolUniverse.ts) + Supabase fallback | Partial | Supabase (if connected) | `lib/demo/schoolUniverse.ts` lines 92-99, `lib/supabase/getStudentsData.ts` lines 82-113 |
| Homework | 🔵 DEMO-SIMULATED | Demo universe (schoolUniverse.ts) + Supabase fallback | Partial | Supabase (if connected) | `lib/demo/schoolUniverse.ts` lines 59-66, `lib/supabase/getStudentsData.ts` lines 115-141 |
| Performance Analytics | 🔴 STATIC/FIXED | Hardcoded in widgets | None | None | `components/teacher/widgets/HomeworkWidget.tsx` lines 15-16, `AttendanceWidget.tsx` lines 15-16 |
| Bus Tracking | 🔵 DEMO-SIMULATED | Demo universe + simulated telemetry | Partial | Supabase (if connected) | `lib/demo/schoolUniverse.ts` lines 102-113, `lib/journey/index.ts` |
| Gate Pass | 🟢 WORKING | Supabase gate_passes table | Full | Supabase | `app/actions/gatePassActions.ts` full CRUD, real-time subscriptions |
| Messaging | 🟢 WORKING | Supabase chat_messages table | Full | Supabase | `app/actions/chatActions.ts`, `NotificationContext.tsx` postgres_changes |
| Wellness | 🟢 WORKING | Supabase mood_checkins table | Partial | Supabase | `app/actions/wellnessActions.ts` |
| Rewards/Gamification | 🔵 DEMO-SIMULATED | Demo universe + Supabase fallback | Partial | Supabase (if connected) | `lib/demo/schoolUniverse.ts` lines 69-75 |
| Copilot | 🔴 HARDCODED STATE | In-memory store (copilotEngine.ts) | In-memory only | None (session only) | `lib/copilot/copilotEngine.ts` lines 163-284, no persistence |
| School Memory | 🔴 STATIC/HARDCODED | Static data (memoryEngine.ts) | None | None | `lib/copilot/memoryEngine.ts` lines 34-56, hardcoded historical cases |
| Intervention Lifecycle | 🔴 HARDCODED STATE | Static data (interventionEngine.ts) | In-memory only | None | `lib/copilot/interventionEngine.ts` lines 26-85 |
| Connected Experience | 🔴 ANIMATION DEMO | Hardcoded story events + setTimeout | Visual only | None | `components/demo/ConnectedExperienceCenter.tsx` lines 35-131, 182-206 |

---

## Detailed Findings

### 1. DATA REALITY AUDIT

#### Real Persisted Data (Supabase)
- **gate_passes**: Full CRUD with audit logs, real-time subscriptions
- **chat_messages**: Full CRUD with real-time notifications
- **mood_checkins**: Full CRUD
- **notifications**: Full CRUD with real-time delivery
- **students**: Basic profile data
- **attendance**: Basic records
- **homework**: Basic records
- **grades**: Basic records

#### Functional Demo Data (Deterministic)
- **lib/demo/schoolUniverse.ts**: Single source of truth for demo universe
  - SCHOOL metadata (lines 8-18)
  - STUDENTS array (lines 21-30)
  - TEACHERS array (lines 35-42)
  - TODAYS_SCHEDULE (lines 47-56)
  - HOMEWORK (lines 59-66)
  - ACHIEVEMENTS (lines 69-75)
  - UPCOMING_EXAMS (lines 78-82)
  - AI_STUDY_TIPS (lines 85-89)
  - ATTENDANCE_SUMMARY (lines 92-99)
  - GATE_ENTRY_LOG (lines 102-113)
  - VENDOR data (lines 126-151)
  - ANNOUNCEMENTS (lines 154-160)
  - ADMIN_ACTIVITY_FEED (lines 163-172)
  - LIVE_ACTIVITY (lines 175-184)
  - DEPT_SUMMARIES (lines 187-193)
  - SCHOOLGPT_HISTORY (lines 196-205)

#### Static Presentation Data (Hardcoded)
- **Teacher Widgets**: HomeworkWidget and AttendanceWidget have hardcoded values
- **Copilot State**: INITIAL_COPILOT_ITEMS hardcoded in copilotEngine.ts
- **School Memory**: HISTORICAL_SIMILAR_CASES hardcoded in memoryEngine.ts
- **Intervention**: DEMO_INTERVENTION_AARAV hardcoded in interventionEngine.ts
- **Connected Experience**: BASELINE_STORY_EVENTS and POST_APPROVAL_STORY_EVENTS hardcoded

#### Broken/Unknown
- **WebSocket Server**: `lib/websocket/server` referenced but missing (server.js line 4)
- **Bus Tracking Telemetry**: Unclear if real GPS or simulated

### 2. CROSS-PORTAL CONSISTENCY ISSUES

#### Student Data Inconsistencies
- **Parent Portal**: Uses server-fetched data with rules engine
- **Student Portal**: Uses demo/schoolUniverse data directly (line 9-15 of StudentPortalClient.tsx)
- **Teacher Portal**: Uses server-fetched data with rules engine
- **Admin Portal**: Uses demo/schoolUniverse data for activity feed (lines 14-20 of AdminDashboardClient.tsx)

#### Homework Count Discrepancy
- **Teacher HomeworkWidget**: Shows "14 Waiting Review" (hardcoded)
- **Student Portal**: Shows pending homework from demo universe (4 pending)
- **Parent Portal**: Shows homework from server fetch
- **INCONSISTENT**: Different counts across portals

#### Attendance Discrepancy
- **Teacher AttendanceWidget**: Shows "96% Present" (hardcoded)
- **Student Portal**: Shows "97% attendance" from ATTENDANCE_SUMMARY
- **Parent Portal**: Shows attendance from server fetch
- **INCONSISTENT**: Different percentages across portals

### 3. REALTIME EVENT BUS AUDIT

#### Working Realtime Subscriptions
- **NotificationContext.tsx**: 
  - Subscribes to `notifications` table INSERT events (lines 90-137)
  - Subscribes to `chat_messages` table INSERT events (lines 144-189)
  - **STATUS**: Working, uses Supabase postgres_changes

#### Admin Dashboard Realtime
- **AdminDashboardClient.tsx**: 
  - Subscribes to multiple tables (lines 148-158):
    - driver_trips
    - student_journey
    - journey_alerts
    - attendance
    - status_flags
    - gate_passes
  - **STATUS**: Working, uses Supabase postgres_changes

#### Copilot State
- **copilotEngine.ts**: 
  - In-memory reactive store with listeners (lines 163-195)
  - No persistence across sessions
  - No database backing
  - **STATUS**: In-memory only, resets on refresh

### 4. CONNECTED EXPERIENCE CENTER AUDIT

#### Implementation
- **File**: `components/demo/ConnectedExperienceCenter.tsx`
- **Data Source**: Hardcoded story events (lines 35-131)
- **Animation**: Uses setTimeout for sequential card highlights (lines 186-193)
- **State**: Local useState for interactive states (lines 148-157)
- **Copilot Integration**: Subscribes to copilotEngine state (line 171)

#### Killer Flow Test
- **Teacher Approval**: Calls `approveCopilotAction('act_001')` (line 259)
- **Effect**: 
  - Updates copilotEngine in-memory state
  - Triggers setTimeout animations (lines 195-199)
  - Adds POST_APPROVAL_STORY_EVENTS to timeline (lines 195-199)
- **Cross-Portal Effect**: 
  - Visual only - no actual database writes
  - Parent/Student/Principal strips update via copilotEngine subscription
  - **NO REAL DOWNSTREAM EFFECTS**

#### Conclusion
- **STATUS**: 🔴 VISUAL DEMO ONLY
- The Connected Experience Center is a sophisticated animation demo, not a real connected system
- Teacher approval does NOT actually:
  - Send notifications to parents
  - Assign homework to students
  - Log interventions in database
  - Update admin records

### 5. COPILOT ARCHITECTURE AUDIT

#### Architecture Type
- **HARDCODED STATE ENGINE** - Not a real LLM, not a rule engine, not hybrid
- **File**: `lib/copilot/copilotEngine.ts`
- **Data**: INITIAL_COPILOT_ITEMS hardcoded (lines 58-161)
- **State**: In-memory reactive store (lines 166-178)
- **Persistence**: None

#### Recommendation Logic
- **Static**: All prepared actions are pre-written
- **No Dynamic Generation**: Changing underlying conditions does NOT change recommendations
- **Trust Signals**: Hardcoded strings (lines 87-90)
- **Historical Evidence**: References hardcoded HISTORICAL_SIMILAR_CASES (lines 92-95)

#### Conclusion
- **STATUS**: 🔴 HARDCODED DEMO
- Copilot is a state machine with pre-written responses, not an AI system

### 6. SCHOOL MEMORY AUDIT

#### Data Source
- **File**: `lib/copilot/memoryEngine.ts`
- **Historical Cases**: HISTORICAL_SIMILAR_CASES hardcoded (lines 34-56)
  - Count: 28 (hardcoded)
  - Success Rate: 84% (hardcoded)
  - Interventions: Pre-defined list (hardcoded)

#### Student Longitudinal Memory
- **AARAV_LONGITUDINAL_MEMORY**: Hardcoded timeline (lines 59-70)
- **Query Functions**: Return static data (lines 75-84)

#### "28 Similar Cases" Claim
- **Source**: Hardcoded constant in memoryEngine.ts line 37
- **Reality**: Not queryable, not dynamic, not based on actual database records
- **Conclusion**: Marketing claim, not technical reality

### 7. GATE PASS FLOW AUDIT

#### Implementation
- **File**: `app/actions/gatePassActions.ts`
- **Database**: Supabase gate_passes table
- **Actions**: 
  - requestGatePassAction (lines 28-131)
  - approveGatePassAction (lines 136-220)
  - rejectGatePassAction (lines 247-327)
  - cancelGatePassAction (lines 332-419)
  - verifyGatePassAction (lines 424-755)

#### Cross-Portal Effects
- **Notifications**: Sends to teacher on request (lines 97-109), guardian on approve (lines 186-198)
- **Ecosystem Events**: Records to ecosystem_events table (lines 111-124, 200-213, etc.)
- **Bus Sync**: Removes student from active bus rosters on gate pass use (lines 666-687)
- **Path Revalidation**: Revalidates /parent, /teacher, /gate, /admin, /driver (lines 126-129, etc.)

#### Status
- **STATUS**: 🟢 FULLY WORKING
- This is the most complete and real feature in the system

### 8. MESSAGING AUDIT

#### Implementation
- **File**: `app/actions/chatActions.ts`
- **Database**: Supabase chat_messages table
- **Actions**:
  - fetchChatMessagesAction (lines 21-45)
  - sendChatMessageAction (lines 50-107)

#### Realtime
- **NotificationContext.tsx**: Subscribes to chat_messages INSERT events (lines 144-189)
- **Cross-Portal**: Teacher and Parent both receive notifications
- **Persistence**: Full Supabase persistence

#### Status
- **STATUS**: 🟢 FULLY WORKING

### 9. WELLNESS AUDIT

#### Implementation
- **File**: `app/actions/wellnessActions.ts`
- **Database**: Supabase mood_checkins table
- **Actions**: submitMoodCheckin

#### Cross-Portal
- **Teacher**: Can view mood in student profiles
- **Parent**: Can submit mood check-ins
- **Rules Engine**: Uses mood data in status calculation

#### Status
- **STATUS**: 🟢 WORKING (partial audit completed)

---

## CRITICAL ISSUES SUMMARY

### 🔴 CRITICAL (Must Fix for Judge Readiness)

1. **Connected Experience Center is Fake**
   - Teacher approval triggers only animations, no real effects
   - Parent/Student/Principal updates are visual only
   - No actual intervention logging
   - **Fix Required**: Connect to real database operations

2. **Copilot is Hardcoded**
   - All recommendations are pre-written
   - No dynamic generation based on conditions
   - In-memory state only (no persistence)
   - **Fix Required**: Either implement real LLM or clearly label as demo

3. **School Memory is Static**
   - "28 similar cases" is hardcoded
   - Not queryable from database
   - No actual longitudinal tracking
   - **Fix Required**: Implement real historical case tracking or remove claims

4. **Cross-Portal Data Inconsistency**
   - Homework counts differ across portals
   - Attendance percentages differ across portals
   - Student portal uses demo data while others use server data
   - **Fix Required**: Unify data sources across all portals

### 🟡 HIGH PRIORITY

5. **Teacher Widgets Have Hardcoded Values**
   - HomeworkWidget shows "14 Waiting Review" (static)
   - AttendanceWidget shows "96% Present" (static)
   - **Fix Required**: Connect to real data

6. **WebSocket Server Missing**
   - server.js references missing `lib/websocket/server`
   - **Fix Required**: Implement or remove reference

7. **No Persistence for Copilot State**
   - Resets on every refresh
   - **Fix Required**: Add database backing or accept as session-only demo

### 🔵 MEDIUM PRIORITY

8. **Bus Tracking Telemetry Unclear**
   - Need to verify if real GPS or simulated
   - **Fix Required**: Clarify or implement real tracking

9. **Demo Mode Bypass**
   - Demo mode bypasses authentication
   - **Fix Required**: Ensure demo mode is clearly labeled

---

## RECOMMENDED DEMO SEQUENCE FOR JUDGES

### What Actually Works (Use These)

1. **Gate Pass Flow** (FULLY WORKING)
   - Parent requests gate pass
   - Teacher approves
   - Gate staff scans
   - Verify cross-portal notifications

2. **Messaging Flow** (FULLY WORKING)
   - Teacher sends message to parent
   - Parent replies
   - Verify real-time notifications

3. **Attendance Flow** (PARTIALLY WORKING)
   - Teacher marks attendance
   - Verify database persistence
   - Note: Cross-portal display may be inconsistent

### What To Avoid (Don't Demo These)

1. **Connected Experience Center**
   - It's a animation demo, not real functionality
   - Will fail if judge tries to verify downstream effects

2. **Copilot "AI Recommendations"**
   - These are hardcoded, not AI-generated
   - Will fail if judge asks for dynamic recommendations

3. **School Memory "28 Similar Cases"**
   - This is a hardcoded number
   - Will fail if judge asks to query similar cases

---

## NEXT STEPS

1. Complete browser testing of all portals
2. Test killer flow with actual database verification
3. Test reverse action (task completion)
4. Test early pickup flow end-to-end
5. Test attendance cross-portal sync
6. Test bus tracking telemetry source
7. Complete dead button audit
8. Generate final judge readiness report

---

**Audit Status**: IN PROGRESS
**Last Updated**: 2026-07-30 (Checkpoint 1)
