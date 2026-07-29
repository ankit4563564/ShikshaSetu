# ShikshaSetu Demo Data Consistency Audit

**Audit Date:** 2026-07-30
**Auditor:** Cascade AI
**Scope:** Demo data consistency across portals, single source of truth verification

---

## DEMO DATA ARCHITECTURE

### Single Source of Truth
**File:** `lib/demo/schoolUniverse.ts`
- Central canonical demo universe
- Used by connected experience center and demo mode
- Contains all deterministic demo data

### Data Fallback Strategy
**File:** `lib/supabase/getStudentsData.ts`
- Primary: Supabase database queries
- Fallback: SEEDED_STUDENTS_MOCK (500 students with systematic data)
- Trigger: Database query failure or placeholder keys

---

## CROSS-PORTAL DATA CONSISTENCY ISSUES

### 1. HOMEWORK COUNT INCONSISTENCY

| Portal | Source | Count | Location |
|--------|--------|-------|----------|
| **Teacher Widget** | Hardcoded | "14 Waiting Review" | `components/teacher/widgets/HomeworkWidget.tsx:16` |
| **Student Portal** | Demo Universe | 4 pending | `lib/demo/schoolUniverse.ts:59-66` |
| **Parent Portal** | Server Fetch | Variable | `app/parent/page.tsx` (dynamic) |
| **Connected Experience** | Not Shown | N/A | N/A |

**Issue:** Teacher widget shows hardcoded "14" while student portal shows 4 pending from demo universe.

**Evidence:**
```typescript
// HomeworkWidget.tsx line 16
<span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
  14 Waiting Review
</span>

// schoolUniverse.ts lines 59-66
export const HOMEWORK = [
  { id: 'hw1', subject: 'Math', title: 'Algebra Worksheet B', dueDate: 'Today', submitted: false },
  { id: 'hw2', subject: 'Science', title: 'Physics Lab Report', dueDate: 'Tomorrow', submitted: false },
  { id: 'hw3', subject: 'English', title: 'Essay Writing', dueDate: 'Tomorrow', submitted: false },
  { id: 'hw4', subject: 'Math', title: 'Geometry Practice', dueDate: 'Friday', submitted: false },
  // ... more items
];
```

### 2. ATTENDANCE PERCENTAGE INCONSISTENCY

| Portal | Source | Percentage | Location |
|--------|--------|------------|----------|
| **Teacher Widget** | Hardcoded | "96% Present" | `components/teacher/widgets/AttendanceWidget.tsx:16` |
| **Student Portal** | Demo Universe | "97% attendance" | `lib/demo/schoolUniverse.ts:95` |
| **Parent Portal** | Server Fetch | Variable | `app/parent/page.tsx` (dynamic) |
| **Connected Experience** | Not Shown | N/A | N/A |

**Issue:** Teacher widget shows hardcoded "96%" while student portal shows "97%" from demo universe.

**Evidence:**
```typescript
// AttendanceWidget.tsx line 16
<span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
  96% Present
</span>

// schoolUniverse.ts line 95
export const ATTENDANCE_SUMMARY = {
  streak: 12,
  presentDays: 28,
  totalDays: 29,
  rate: 0.97, // 97%
};
```

### 3. STUDENT DATA SOURCE INCONSISTENCY

| Portal | Data Source | File |
|--------|-------------|------|
| **Parent Portal** | Server fetch with rules engine | `app/parent/page.tsx` |
| **Student Portal** | Demo universe direct import | `components/student/StudentPortalClient.tsx:9-15` |
| **Teacher Portal** | Server fetch with rules engine | `app/teacher/page.tsx` |
| **Admin Portal** | Demo universe direct import | `components/admin/AdminDashboardClient.tsx:14-20` |

**Issue:** Student and Admin portals use demo universe directly, while Parent and Teacher use server fetch.

**Evidence:**
```typescript
// StudentPortalClient.tsx lines 9-15
import {
  TODAYS_SCHEDULE,
  HOMEWORK,
  ACHIEVEMENTS,
  UPCOMING_EXAMS,
  AI_STUDY_TIPS,
  ATTENDANCE_SUMMARY,
} from '@/lib/demo/schoolUniverse';

// AdminDashboardClient.tsx lines 14-20
import {
  ADMIN_ACTIVITY_FEED,
  DEPT_SUMMARIES,
  ANNOUNCEMENTS,
  GATE_ENTRY_LOG,
  GATE_DAILY_STATS,
} from '@/lib/demo/schoolUniverse';
```

### 4. SUPPORT RADAR STUDENT LIST INCONSISTENCY

| Portal | Source | Students | Location |
|--------|--------|----------|----------|
| **Teacher Widget** | Hardcoded array | 3 students | `components/teacher/widgets/SupportRadarWidget.tsx:7-11` |
| **Rules Engine** | Dynamic calculation | Variable | `lib/rules-engine/calculateStatus.ts` |
| **Connected Experience** | Hardcoded | Aarav only | `components/demo/ConnectedExperienceCenter.tsx` |

**Issue:** Support radar shows hardcoded 3 students with fixed scores, not dynamic from rules engine.

**Evidence:**
```typescript
// SupportRadarWidget.tsx lines 7-11
const atRiskStudents = [
  { id: '1', name: 'Aarav Sharma', score: '92%', status: 'ON TRACK', statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { id: '2', name: 'Priya Patel', score: '78%', status: 'WATCHING', statusColor: 'text-amber-700 bg-amber-50 border-amber-200' },
  { id: '3', name: 'Rohan Kumar', score: '64%', status: 'ATTENTION', statusColor: 'text-rose-700 bg-rose-50 border-rose-200' },
];
```

---

## DEMO MODE AUTHENTICATION

### Demo Session System
**File:** `lib/demo/session.ts`
- HMAC-signed demo sessions
- TTL: 86400 seconds (24 hours)
- Roles: teacher, parent, student, admin, driver, gate, vendor

### Demo Profiles
**File:** `lib/demo/demoAuth.ts`
- Pre-defined demo accounts with credentials
- All use password: `ShikshaSetu2026!`
- Bypasses Clerk authentication

**Evidence:**
```typescript
// demoAuth.ts lines 15-93
const DEMO_PROFILES: Record<string, DemoProfile> = {
  teacher: { email: 'teacher@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  parent: { email: 'parent@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  student: { email: 'student@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  admin: { email: 'admin@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  driver: { email: 'driver@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  gate: { email: 'gate@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
  vendor: { email: 'vendor@shikshasetu.com', password: 'ShikshaSetu2026!', ... },
};
```

---

## BUS TRACKING DATA

### Demo Universe Bus Data
**File:** `lib/demo/schoolUniverse.ts` lines 102-113
- GATE_ENTRY_LOG with simulated bus arrival
- No real GPS coordinates
- No real-time telemetry

### Parent Bus Tracking Tab
**File:** `components/parent/ParentBusTrackingTab.tsx`
- Default metrics: speed: 22 km/h, nextStop: 'Lodhi Gardens', eta: 4
- Map placeholder: "Loading map layer..."
- No actual map integration

**Evidence:**
```typescript
// ParentBusTrackingTab.tsx lines 31-32
busMetrics = { speed: 22, nextStop: 'Lodhi Gardens', eta: 4 },
lastUpdated = 0,

// ParentBusTrackingTab.tsx line 104
<div className="h-[250px] w-full rounded-lg bg-paper border border-deep-teal/5 animate-pulse flex items-center justify-center text-xs text-deep-teal/30">
  Loading map layer...
</div>
```

---

## SCHOOL MEMORY DATA

### Historical Cases
**File:** `lib/copilot/memoryEngine.ts` lines 34-56
- HISTORICAL_SIMILAR_CASES hardcoded
- Count: 28 (constant)
- Success rate: 84% (constant)
- Not queryable from database

### Student Longitudinal Memory
**File:** `lib/copilot/memoryEngine.ts` lines 59-70
- AARAV_LONGITUDINAL_MEMORY hardcoded
- Timeline: September to Last Week
- Not based on actual database records

**Evidence:**
```typescript
// memoryEngine.ts lines 34-37
export const HISTORICAL_SIMILAR_CASES: HistoricalCase = {
  id: 'case_hw_drop_01',
  pattern: 'Repeated homework misses combined with declining morning attendance usually indicate a student may benefit from an early teacher check-in.',
  count: 28, // HARDCODED
  interventions: [...],
};
```

---

## COPILOT STATE DATA

### Initial Copilot Items
**File:** `lib/copilot/copilotEngine.ts` lines 58-161
- INITIAL_COPILOT_ITEMS hardcoded
- 3 pre-written intervention items
- No dynamic generation based on conditions

**Evidence:**
```typescript
// copilotEngine.ts lines 58-161
export const INITIAL_COPILOT_ITEMS: CopilotItem[] = [
  {
    id: 'act_001',
    studentId: 's001',
    studentName: 'Aarav Sharma',
    flagTitle: 'Homework missed 3 consecutive days',
    flagType: 'homework_gap',
    status: 'pending',
    trustSignals: ['3 missed assignments', 'Grade drop from A to B+', 'Mood: "feeling overwhelmed"'],
    recommendedAction: 'Send WhatsApp update + assign practice sheet',
    confidence: 92,
    evidence: [...],
  },
  // ... more items
];
```

---

## INTERVENTION LIFECYCLE DATA

### Demo Intervention
**File:** `lib/copilot/interventionEngine.ts` lines 26-85
- DEMO_INTERVENTION_AARAV hardcoded
- 7 milestones with pre-defined timestamps
- No actual database logging

**Evidence:**
```typescript
// interventionEngine.ts lines 26-85
export const DEMO_INTERVENTION_AARAV: SupportIntervention = {
  id: 'int_001',
  studentId: 's001',
  studentName: 'Aarav Sharma',
  flagTitle: 'Homework missed 3 consecutive days',
  status: 'active',
  timeSavedMinutes: 48,
  milestones: [
    { id: 'm1', timestamp: 'Jul 28 · 07:30 AM', title: 'Signal Flagged: Homework missed 3 consecutive days', status: 'completed', actor: 'Academic Telemetry' },
    // ... more milestones
  ],
};
```

---

## CONNECTED EXPERIENCE DATA

### Story Events
**File:** `components/demo/ConnectedExperienceCenter.tsx`
- BASELINE_STORY_EVENTS hardcoded (lines 35-80)
- POST_APPROVAL_STORY_EVENTS hardcoded (lines 82-131)
- SCHOOL_MEMORY_TIMELINE hardcoded (lines 135-141)

**Evidence:**
```typescript
// ConnectedExperienceCenter.tsx lines 35-80
const BASELINE_STORY_EVENTS: NarrativeEvent[] = [
  {
    id: 'evt-1',
    time: '08:05 AM',
    actor: 'Campus Gate',
    title: 'Aarav Arrived at School',
    description: 'RFID scan confirmed at Gate #2. Morning attendance recorded for Class 8A.',
    icon: '🏫',
    badge: 'Attendance',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300',
  },
  // ... more events
];
```

---

## CRITICAL INCONSISTENCIES SUMMARY

### 🔴 CRITICAL

1. **Homework Count Mismatch**
   - Teacher: 14 (hardcoded)
   - Student: 4 (demo universe)
   - **Impact:** Different numbers shown across portals

2. **Attendance Percentage Mismatch**
   - Teacher: 96% (hardcoded)
   - Student: 97% (demo universe)
   - **Impact:** Different percentages shown across portals

3. **Data Source Inconsistency**
   - Student/Admin: Demo universe direct
   - Parent/Teacher: Server fetch
   - **Impact:** Different data sources for same entities

### 🟡 HIGH PRIORITY

4. **Support Radar Hardcoded**
   - 3 students with fixed scores
   - Not dynamic from rules engine
   - **Impact:** False sense of real-time monitoring

5. **Bus Tracking No Real Data**
   - Map placeholder
   - Default metrics hardcoded
   - **Impact:** False sense of live tracking

6. **School Memory Static**
   - "28 similar cases" hardcoded
   - Not queryable
   - **Impact:** False historical claims

### 🔵 MEDIUM PRIORITY

7. **Copilot State Hardcoded**
   - Pre-written interventions
   - No dynamic generation
   - **Impact:** False AI claims

8. **Intervention Lifecycle Static**
   - Pre-defined milestones
   - No actual logging
   - **Impact:** False workflow claims

---

## RECOMMENDATIONS

### Immediate Fixes

1. **Unify Data Sources**
   - All portals should use server fetch
   - Remove direct demo universe imports from Student/Admin portals
   - Implement proper fallback strategy

2. **Fix Hardcoded Widgets**
   - Connect HomeworkWidget to real data
   - Connect AttendanceWidget to real data
   - Connect SupportRadarWidget to rules engine

3. **Implement Real Bus Tracking**
   - Replace map placeholder with actual map
   - Connect to real GPS telemetry
   - Or clearly label as demo

### Long-term Improvements

4. **Implement Real School Memory**
   - Query actual historical cases from database
   - Implement longitudinal tracking
   - Remove hardcoded "28 cases"

5. **Implement Dynamic Copilot**
   - Generate recommendations based on actual conditions
   - Connect to real LLM or rule engine
   - Remove pre-written responses

---

**Audit Status:** COMPLETED
**Last Updated:** 2026-07-30
