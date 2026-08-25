# ShikshaSetu Parent Portal Production Audit

**Document Version:** 1.0.0  
**Audit Date:** August 25, 2026  
**Auditor:** Antigravity AI Engineering Team  
**Scope:** Complete End-to-End Parent Experience, Backend Server Actions, Database Tables, Security Scoping, RLS, Domain Events, and Cross-Portal Synchronization.

---

## Executive Summary

The ShikshaSetu Parent Portal has solid foundational infrastructure in place:
1. Strong multi-tenant security model (`getAuthContext()`, `createScopedClient()`, `validateParentStudentAccess()`, Clerk user onboarding, and `guardians` + `guardian_access` tables).
2. Robust backend actions for attendance, gate passes, homework publishing/submissions, notifications, exams/marks, calendar events, and interventions.
3. Event-driven cross-portal propagation via `recordEcosystemEvent` and `portalSync` real-time broadcasting.

However, the **Parent Portal UI and client presentation layer had significant gaps and discrepancies**:
- **Fake/Hardcoded Today Timeline:** `ParentTodayClientRefactored.tsx` was rendering static mock journey items (e.g. "8:14 entered school", "12:30 lunch break") and static arrival headers instead of deriving the story from real DB attendance, gate passes, homework, and calendar entries.
- **Disconnected Messaging:** The Messages tab was an empty shell showing "No messages yet" with no input field or send mechanism, despite `chatActions.ts` and `chat_messages` table existing and being ready.
- **Orphaned Results/Marks UI:** `ParentMarksView.tsx` was built with subject-wise analytics, trends, and AI summaries, but was **never mounted** in `ParentTodayClientRefactored.tsx` or reachable from parent navigation.
- **Missing School Calendar / Notices View:** `school_calendar` exists in the database and is mutated by admins/teachers, but had no parent-facing calendar/notices UI.
- **Notification Spinner Bug:** `NotificationBell.tsx` threw a permanent loading spinner when `dbNotifications` was empty because `recipientId` resolved to `null` on new parent accounts.
- **Untruthful GPS Bus Tracking:** The bus tracking tab showed a fake animated map and simulated movement even when no live vehicle telemetry hardware was broadcasting.
- **Missing Student Growth / Support Plan View:** Interventions and tasks existed in the database, but parents had no clean view of authorized academic support plans.
- **Missing Document Locker:** No parent-accessible storage viewer for report cards, fee receipts, and certificates.

---

## Comprehensive Feature-by-Feature Audit Matrix

| Feature | Current UI | Backend | Database | Authorization | Cross-Portal Synchronization | Status | Missing Work | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Parent Today** | `ParentTodayClientRefactored.tsx` (Tab 1) | `getStudentsData()`, `evidence_logs`, `gate_passes` | `students`, `attendance`, `homework`, `gate_passes`, `school_calendar` | `getAuthContext()`, `guardian_access` linked child validation | Reflects DB state on revalidate/refresh | 🟡 Partially Connected (Contains Fake Static Timeline) | Replace hardcoded journey items and entry hero with real daily timeline built from real DB attendance, homework due dates, active gate passes, and calendar notices. Honest empty state when no activity recorded. | **P0** |
| **2. Attendance** | `ParentAttendanceTab.tsx` + Home summary | `attendanceActions.ts` (Batch writer), `getStudentsData()` | `attendance`, `attendance_operations` | Role `parent`, `guardian_access` validation | Teacher marks attendance $\rightarrow$ `recordEcosystemEvent` $\rightarrow$ Parent updates | 🟡 Functional but basic | Add explicit today badge ("Present", "Absent", "Late", "Not marked yet"), monthly attendance %, recent trend, and school threshold warning alert when attendance < 75% ("Attendance is below the school target"). | **P0** |
| **3. Homework** | `ParentHomeworkTab.tsx` + Home progress card | `homeworkActions.ts` (`publishHomeworkAssignmentAction`, `submitHomeworkAction`) | `homework`, `homework_submissions` | Tenant-scoped, student-scoped | Teacher publishes $\rightarrow$ Student/Parent see assignment; Student submits $\rightarrow$ Teacher/Parent see status | 🟢 Connected | Enrich item cards with full instructions, attachment download links, submission timestamps, teacher notes, and overdue warning badges. | **P0** |
| **4. Gate / Pickup** | `ParentGatePassTab.tsx` + Request modal | `gatePassActions.ts` (`requestGatePassAction`, `cancelGatePassAction`, `approveGatePassAction`) | `gate_passes`, `gate_pass_audit_logs`, `guardian_access` | `validateParentStudentAccess()`, HMAC token signing | Parent requests $\rightarrow$ Teacher approves $\rightarrow$ Parent gets 6-digit code & dynamic QR $\rightarrow$ Gate scans & checks out $\rightarrow$ Parent receives checkout confirmation | 🟢 Fully Wired Backend | Add pickup person selector in request modal, show live checkout timestamp ("Checked out at 3:42 PM by Sunita Sharma"), and integrate checkout state into Today timeline. | **P0** |
| **5. Notifications** | `NotificationBell.tsx` + `NotificationCenter.tsx` | `notificationActions.ts`, `lib/notifications/service.ts` | `notifications`, `notification_deliveries` | Authenticated recipient matching | Domain events trigger notifications to parent recipient IDs | 🟡 Working with Edge-Case Bug | Fix infinite loading spinner when `recipientId` is null on empty inbox; add category tabs: CRITICAL, IMPORTANT, NORMAL; ensure parent recipient ID is passed from server context. | **P0** |
| **6. School Notices / Calendar** | *None mounted in Parent Portal* | `calendarActions.ts` (`fetchCalendarPeriodsAction`) | `school_calendar` | Tenant-scoped, authenticated user | Admin creates calendar event $\rightarrow$ broadcasts ecosystem event | 🔴 Missing UI | Build dedicated Parent Notices & Calendar view (Holidays, Exams, PTM, Announcements, Upcoming this week) with `.ics` calendar export. | **P0** |
| **7. Messages** | Tab 5 placeholder ("No messages yet") | `chatActions.ts` (`fetchChatMessagesAction`, `sendChatMessageAction`) | `chat_messages` | `requireAuth()`, scoped to student thread & class teacher | Parent sends message $\rightarrow$ Teacher receives notification $\rightarrow$ Teacher replies $\rightarrow$ Parent sees unread indicator | 🟡 Backend Ready, UI Disconnected | Connect interactive 2-way messaging interface between authorized parent and student's class teacher (`students.class_teacher_id`), displaying real-time message stream, optimistic sending, and context tags. | **P0** |
| **8. Academic Performance (Marks)** | `ParentMarksView.tsx` (Orphaned component) | `marksActions.ts` (`getStudentMarksAction`, `getStudentTrendAction`) | `exams`, `grades` | Authenticated user, child-scoped | Teacher publishes marks $\rightarrow$ Parent/Student see results | 🟡 Component Exists but Unmounted | Mount `ParentMarksView` into parent navigation/tab layout with published-only evaluation checks, subject-wise scores, historical trends, and AI performance summaries. | **P1** |
| **9. Student Support (Growth Plan)** | `ParentCopilotStrip.tsx` (Static text) | `interventionActions.ts`, `lib/support-signals` | `interventions`, `intervention_milestones`, `student_tasks` | Privacy filter: hides counselor private notes and teacher internal notes | Teacher approves support plan $\rightarrow$ Parent notified of parent-visible goals | 🟡 Backend Ready, UI Incomplete | Build "Academic Support Plan" card: Goal, Next review date, Suggested home support (e.g. 20 min revision/day), Parent-visible tasks, strictly redacting internal counselor/teacher notes. | **P1** |
| **10. Document Locker** | *None in Parent Portal* | Supabase Storage + scoped URLs | `students` (student_id), Storage buckets | Tenant-scoped, child-scoped, signed URL | Admin/Teacher uploads report card / certificate $\rightarrow$ Parent downloads | 🔴 Missing UI | Implement "My Child's Documents" view (Report cards, Bonafide certificates, Fee receipts, School notices, Transfer Certificates) with secure authenticated access. | **P1** |
| **11. Child Switching** | `ParentStudentHeader.tsx` dropdown | `guardian_access` resolver in `app/parent/page.tsx` | `guardians`, `guardian_access`, `students` | Server resolves guardian $\rightarrow$ linked children | Parent switches dropdown $\rightarrow$ all child data streams update | 🟢 Implemented | Ensure switching active student re-binds all tabs (Today, Attendance, Homework, Marks, Gate Pass, Documents, Messages) cleanly without state cross-contamination. | **P1** |
| **12. Fees** | *None in Parent Portal* | No active payment gateway integrated | `fee_structures` / `student_fees` (mock/schema) | Guardian-authorized | School records fee receipt $\rightarrow$ Parent sees status | 🟡 Needs Truthful UI | Display truthful Fee Summary card (Tuition, Transport, Activity fees, Paid vs. Pending amounts, Due dates, Receipt download) with clear "Online payment integration coming soon with school bank partner" (no fake payment gateway). | **P1** |
| **13. Transport** | `ParentBusTrackingTab.tsx` (Simulated map) | `bus_locations`, `canonicalBusLocation.ts` | `bus_locations` | Tenant-scoped | Driver updates location $\rightarrow$ Parent receives live broadcast | 🟡 Untruthful Simulation | Remove fake blinking map simulation when GPS hardware is offline. Display truthful route details (Bus #, Driver contact, Pickup Stop, Morning ETA, Drop ETA) and status banner. | **P2** |
| **14. Parent AI Assistant** | `SchoolGPTChat.tsx` / `ParentCopilotStrip.tsx` | `schoolgptActions.ts` (`askSchoolGPTAction`), `PermissionEngine.ts` | `schoolgpt_conversations`, vector/DB retrieval | Strict Parent Role Boundary (blocks internal teacher notes, other students) | AI queries DB state in real-time | 🟢 Backend Ready | Mount Contextual Parent Assistant drawer with instant prompt chips ("Did Aarav reach school today?", "What homework is due tomorrow?", "How is attendance?", "When is the next exam?"). | **P2** |
| **15. Smart Action Center** | *None in Parent Portal* | Computed from student data (Attendance %, pending HW, gate pass status, unread notes) | `attendance`, `homework`, `gate_passes`, `notifications` | Child-scoped | Direct deep links to required actions | 🔴 Missing | Add "Smart Action Center" on Today tab highlighting urgent action items with one-tap action buttons. | **P1** |

---

## 10-Point Technical Verification for Each Required Capability

### 1. Parent Today (Chronological Daily Summary)
1. **Does it already exist?** Yes, in `ParentTodayClientRefactored.tsx`.
2. **Is it connected to REAL database data?** Partially. It fetches `students`, `evidence_logs`, and `gate_passes`, but rendered a hardcoded static timeline (`{ time: '08:14', event: 'Entered School' }`).
3. **Is it connected to the correct Server Action/API?** Fetches via `app/parent/page.tsx` using `getStudentsData()`.
4. **Is it tenant-scoped?** Yes, via `school_id` filtering in `getAuthContext()` and `createScopedClient()`.
5. **Is it role/guardian-authorized?** Yes, restricted to `guardian_access` linked students.
6. **Is the data reflected across other portals when changed?** Yes, via `revalidatePath('/parent')` and `portalSync`.
7. **Is the UI actually reachable from the parent portal?** Yes, it is the default landing tab.
8. **Is the feature complete end-to-end?** No, the timeline and arrival message were fabricated.
9. **Is it production-safe?** No, fabricating student arrival times is a major safety violation.
10. **What is missing?** Dynamic timeline built strictly from real records: today's recorded arrival, today's marked attendance status, homework assigned/due today, active gate pass status, and upcoming school calendar events.

### 2. Attendance View
1. **Does it already exist?** Yes, in `ParentAttendanceTab.tsx`.
2. **Is it connected to REAL database data?** Yes, queries `attendance` table.
3. **Is it connected to the correct Server Action/API?** Read via `getStudentsData()`, written via `recordAttendanceBatchAction`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, parent can only see their linked child's attendance.
6. **Is the data reflected across other portals when changed?** Yes, teacher attendance marking immediately invalidates parent cache.
7. **Is the UI actually reachable?** Yes, via Attend tab.
8. **Is the feature complete end-to-end?** Mostly, but lacks today's explicit status, breakdown, and low-attendance alert.
9. **Is it production-safe?** Yes.
10. **What is missing?** Prominent today status badge, monthly percentage summary, and school threshold warning (<75% target).

### 3. Homework View
1. **Does it already exist?** Yes, in `ParentHomeworkTab.tsx`.
2. **Is it connected to REAL database data?** Yes, queries `homework` and `homework_submissions`.
3. **Is it connected to the correct Server Action/API?** `homeworkActions.ts`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, child-scoped.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Yes, via Homework tab.
8. **Is the feature complete end-to-end?** Basic checklist only.
9. **Is it production-safe?** Yes.
10. **What is missing?** Assignment instructions, attachments, submission timestamp, teacher feedback, and overdue indicators.

### 4. Gate / Pickup (Early Dismissal & QR Safety)
1. **Does it already exist?** Yes, in `ParentGatePassTab.tsx`.
2. **Is it connected to REAL database data?** Yes, `gate_passes` and `gate_pass_audit_logs`.
3. **Is it connected to the correct Server Action/API?** `gatePassActions.ts` (`requestGatePassAction`, `cancelGatePassAction`).
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, `validateParentStudentAccess()`.
6. **Is the data reflected across other portals?** Yes, teacher approves in Teacher Portal, Gate Officer scans in Gate Portal, Parent sees live status.
7. **Is the UI reachable?** Yes.
8. **Is the feature complete end-to-end?** Yes.
9. **Is it production-safe?** Yes, uses dynamic cryptographically signed HMAC QR tokens.
10. **What is missing?** Pickup guardian selector on request modal and live checkout confirmation display.

### 5. Unified Parent Notification Center
1. **Does it already exist?** Yes, `NotificationBell.tsx` and `NotificationCenter.tsx`.
2. **Is it connected to REAL database data?** Yes, `notifications` table.
3. **Is it connected to the correct Server Action/API?** `notificationActions.ts`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Yes, bell icon in header.
8. **Is the feature complete end-to-end?** Has an edge-case crash when recipientId is null.
9. **Is it production-safe?** After fixing the null recipientId fallback.
10. **What is missing?** Explicit recipient ID passing from parent page and priority category filters (Critical, Important, Normal).

### 6. School Notices / Calendar
1. **Does it already exist?** Backend exists (`school_calendar`, `calendarActions.ts`), UI missing in parent portal.
2. **Is it connected to REAL database data?** Yes.
3. **Is it connected to the correct Server Action/API?** `fetchCalendarPeriodsAction`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No.
8. **Is the feature complete end-to-end?** No, UI missing.
9. **Is it production-safe?** Once UI is mounted.
10. **What is missing?** Parent calendar & notice board view with event categories (Holidays, Exams, PTM, Announcements).

### 7. Parent-Teacher Messaging
1. **Does it already exist?** Backend exists (`chat_messages`, `chatActions.ts`), UI tab was a static shell.
2. **Is it connected to REAL database data?** Backend is, UI was not calling it.
3. **Is it connected to the correct Server Action/API?** `fetchChatMessagesAction`, `sendChatMessageAction`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, authorized only between parent and student's assigned class teacher.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Tab 5 was reachable but unusable.
8. **Is the feature complete end-to-end?** No, message composition was disabled.
9. **Is it production-safe?** Once connected.
10. **What is missing?** Fully connected 2-way message chat UI with instant delivery, teacher details, and context tags.

### 8. Academic Performance (Marks / Results)
1. **Does it already exist?** Component exists (`ParentMarksView.tsx`), but unmounted.
2. **Is it connected to REAL database data?** Yes, `exams` and `grades`.
3. **Is it connected to the correct Server Action/API?** `getStudentMarksAction`, `getStudentTrendAction`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, filters for published marks only (`is_published: true`).
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No, not mounted in navigation.
8. **Is the feature complete end-to-end?** Missing navigation access.
9. **Is it production-safe?** Yes.
10. **What is missing?** Mount `ParentMarksView` in bottom navigation / tab bar.

### 9. Student Support / Growth Plan
1. **Does it already exist?** Backend exists in `interventions`, `student_tasks`.
2. **Is it connected to REAL database data?** Backend is, parent UI had static text.
3. **Is it connected to the correct Server Action/API?** `interventionActions.ts`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, strict redaction of private teacher/counselor notes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No dedicated parent support tab.
8. **Is the feature complete end-to-end?** No.
9. **Is it production-safe?** Yes, privacy boundary enforced.
10. **What is missing?** Parent-visible Growth Plan card showing goals, review date, and home support tips.

### 10. Document Locker
1. **Does it already exist?** No parent document viewer.
2. **Is it connected to REAL database data?** Supabase Storage buckets exist.
3. **Is it connected to the correct Server Action/API?** Needs client/server action.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No.
8. **Is the feature complete end-to-end?** No.
9. **Is it production-safe?** Yes, with private signed URLs.
10. **What is missing?** Document locker UI for report cards, fee receipts, bonafide certificates, and forms.

### 11. Child Switching
1. **Does it already exist?** Yes, in `ParentStudentHeader.tsx`.
2. **Is it connected to REAL database data?** Yes, `guardians` $\rightarrow$ `guardian_access`.
3. **Is it connected to the correct Server Action/API?** Resolved server-side in `app/parent/page.tsx`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Yes, header selector.
8. **Is the feature complete end-to-end?** Yes.
9. **Is it production-safe?** Yes.
10. **What is missing?** Smooth cascade to all new tabs (Results, Documents, Support, Notices).

### 12. Fees (Truthful Fee Summary)
1. **Does it already exist?** No parent UI.
2. **Is it connected to REAL database data?** No payment gateway.
3. **Is it connected to the correct Server Action/API?** N/A.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No.
8. **Is the feature complete end-to-end?** Must be implemented without fake payment simulation.
9. **Is it production-safe?** Yes, as a read-only statement.
10. **What is missing?** Truthful fee status breakdown (Tuition, Transport, Lab fees, Paid vs. Pending amounts, Due dates, Receipt download) with clear bank transfer info.

### 13. Transport (Truthful Bus & Route Info)
1. **Does it already exist?** Yes, `ParentBusTrackingTab.tsx`.
2. **Is it connected to REAL database data?** Partially (`bus_locations`).
3. **Is it connected to the correct Server Action/API?** `getCanonicalBusLocation()`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Yes, Bus tab.
8. **Is the feature complete end-to-end?** Simulated GPS when hardware is offline.
9. **Is it production-safe?** Needs truthful offline state.
10. **What is missing?** Honest display: static route information (Bus #, Stop, ETA, Driver) + status banner when live GPS is offline.

### 14. Parent AI Assistant (Contextual SchoolGPT)
1. **Does it already exist?** Backend `askSchoolGPTAction` and `PermissionEngine.ts` exist.
2. **Is it connected to REAL database data?** Yes, live retrievers query DB for attendance, homework, exams, events.
3. **Is it connected to the correct Server Action/API?** `schoolgptActions.ts`.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes, PermissionEngine strictly restricts parent to linked children and public school info.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** Copilot strip exists; needs quick interactive drawer.
8. **Is the feature complete end-to-end?** Backend ready.
9. **Is it production-safe?** Yes.
10. **What is missing?** Contextual quick question sheet with instant parent chips.

### 15. Smart Action Center
1. **Does it already exist?** No.
2. **Is it connected to REAL database data?** Computed from active student data.
3. **Is it connected to the correct Server Action/API?** Reuses existing data streams.
4. **Is it tenant-scoped?** Yes.
5. **Is it role/guardian-authorized?** Yes.
6. **Is the data reflected across other portals?** Yes.
7. **Is the UI reachable?** No.
8. **Is the feature complete end-to-end?** Needs UI.
9. **Is it production-safe?** Yes.
10. **What is missing?** "You may want to review" action card on Today screen.

---

## Strategic Implementation Roadmap

### Phase 1: Core P0 Daily Life Foundation
- **P0.1: Parent Today Overhaul:** Remove all static/hardcoded timeline items. Compute real chronological timeline from today's attendance, homework, active gate pass, and calendar events.
- **P0.2: Smart Action Center:** Add prominent action cards for pending homework, gate pass status, low attendance warnings, and urgent notices.
- **P0.3: Attendance Enhancements:** Add today's status badge, monthly percentage, breakdown pills, and <75% target threshold alert.
- **P0.4: Homework View Polish:** Provide assignment details, instructions, teacher feedback, and submission state.
- **P0.5: Real 2-Way Parent-Teacher Chat:** Connect `fetchChatMessagesAction` and `sendChatMessageAction` to Tab 5 with full message stream and composition.
- **P0.6: School Notices & Calendar Tab:** Build and mount the Calendar & Notices view with upcoming exams, holidays, PTMs, and announcements.
- **P0.7: Gate Pass & Dismissal:** Wire pickup person selector and checkout confirmation banner.
- **P0.8: Notification Center Fix:** Ensure `recipientId` is passed from parent context and fix infinite loading spinner.

### Phase 2: P1 Academic, Support & Practical Features
- **P1.1: Mount Academic Performance (Marks / Results):** Integrate `ParentMarksView` into the tab navigation with published scores, trends, and AI analysis.
- **P1.2: Student Support (Academic Growth Plan):** Create a dedicated Growth Plan card for parent-visible intervention goals and home tips.
- **P1.3: Document Locker:** Implement "My Child's Documents" with secure signed access for report cards, fee receipts, and certificates.
- **P1.4: Truthful Fee Overview:** Implement a transparent fee schedule and status view (paid, pending, due date, receipt download) without fake payment simulation.

### Phase 3: P2 Safety & AI Refinement
- **P2.1: Truthful Transport Tab:** Display verified bus route, stops, timing, and driver info without fake GPS map simulation.
- **P2.2: Contextual Parent AI Assistant:** Add instant parent query drawer with quick chips strictly bound to the authenticated child.
- **P2.3: Verification & Automated Tests:** Unit tests for parent queries, auth context, gate pass flows, and cross-portal synchronization.
