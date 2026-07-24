# ShikshaSetu Integration Test Matrix

Every row is a user-facing action. Every column must be green (✅) for the platform to be fully integrated.

## Actions → System Impact

| Action | DB Write | Event Bus | Realtime Propagated | Notification | Analytics Readable | Ecosystem Event (Audit) |
|--------|----------|-----------|-------------------|--------------|-------------------|------------------------|
| **Driver scans board QR** | ✅ `scan_events`, `student_journey` | ✅ `scan:transport_board` → `boardStudent()` | ✅ via `student_journey` realtime to Parent, Teacher, Admin, Student | ✅ via `createEcosystemNotifications` | ✅ `scan_events` readable | ✅ via `recordEcosystemEvent` |
| **Driver scans deboard QR** | ✅ `scan_events`, `student_journey` | ✅ `scan:transport_deboard` → `deboardStudent()` | ✅ via `student_journey` realtime | ✅ via `createEcosystemNotifications` | ✅ `scan_events` readable | ✅ via `recordEcosystemEvent` |
| **Gate scans entry** | ✅ `scan_events` | ✅ `scan:gate_entry` → gate handler | ✅ via `student_journey`, `scan_events` to Admin | ✅ via `getStudentCareTeamRecipients` | ✅ `scan_events` readable | ✅ via `recordEcosystemEvent` |
| **Gate scans exit** | ✅ `scan_events` | ✅ `scan:gate_exit` → gate handler | ✅ via `scan_events` to Admin | ✅ via `getStudentCareTeamRecipients` | ✅ `scan_events` readable | ✅ via `recordEcosystemEvent` |
| **Parent requests gate pass** | ✅ `gate_passes` | ✅ via server action | ✅ via `gate_passes` realtime on Teacher dashboard | ✅ `ecosystem_events` | N/A | ✅ via `recordEcosystemEvent` |
| **Teacher approves gate pass** | ✅ `gate_passes` | ✅ via server action | ✅ via `gate_passes` realtime on Parent portal | ✅ via `createEcosystemNotifications` | N/A | ✅ via `recordEcosystemEvent` |
| **Parent confirms home safe** | ✅ `student_journey` status update | ✅ via `confirmHomeSafe` | ✅ via `student_journey` realtime | ✅ via `createEcosystemNotifications` | N/A | ✅ via `recordEcosystemEvent` |
| **Student submits mood check-in** | ✅ `mood_checkins` | ✅ via server action | ✅ via `mood_checkins` realtime on Teacher dashboard | ✅ teacher notified | N/A | ✅ via `recordEcosystemEvent` |
| **Parent submits mood check-in** | ✅ `mood_checkins` | ✅ via server action | ✅ via `mood_checkins` read on parent portal | N/A (self) | N/A | N/A |
| **Student sends chat message** | ✅ `chat_messages` | ✅ via server action | ✅ via `chat_messages` realtime on Teacher chat + Parent chat | ✅ via `NotificationContext` | N/A | ✅ via `recordEcosystemEvent` |
| **Teacher sends chat message** | ✅ `chat_messages` | ✅ via server action | ✅ via `chat_messages` realtime on Parent chat | ✅ via `NotificationContext` | N/A | ✅ via `recordEcosystemEvent` |
| **Student claims quest XP** | ✅ `achievements` via `createStudentAchievementAction` | N/A (client-only) | N/A (client state) | N/A | N/A | ✅ via `createStudentAchievementAction` |
| **Student buys shop item** | ✅ `achievements` via `createStudentAchievementAction` | N/A (client-only) | N/A (coins in-memory) | N/A | N/A | ✅ via `createStudentAchievementAction` |

## Legend
- ✅ Fully implemented and verified
- ⚠️ Partially implemented (noted)
- ❌ Missing (none found in current audit)

## Security Coverage

| Layer | Status | Notes |
|-------|--------|-------|
| Clerk middleware | ✅ | All routes protected, unauthenticated → sign-in |
| API route role guards | ✅ | `requireRole()` helper on all 6 routes |
| RLS: students | ✅ | Admins full, teachers for their class, guardians for their children |
| RLS: teachers | ✅ | Admins full, self, parents of assigned students |
| RLS: guardians | ✅ | Admins full, self, teachers of linked students |
| RLS: attendance | ✅ | Admins, teachers of class, guardians of student |
| RLS: gate_passes | ✅ | Admins, teachers of class, guardians of student |
| RLS: scan_events | ✅ | Admins, teachers of class, guardians of student; insert for any auth |
| RLS: notifications | ✅ | Admins, recipient by UUID (self) |
| RLS: ecosystem_events | ✅ | Admins, teachers of class, guardians of student; insert for any auth |
| RLS: evidence_logs | ✅ | Admins, teachers of class, guardians of student; insert for teachers of class |
| RLS: guardian_preferences | ✅ | Guardian self (insert/update/select) |

## Event Bus Listener Coverage

| Event | Listeners | Status |
|-------|-----------|--------|
| `scan:transport_board` | transportHandler (boardStudent), aiHandler (stub) | ✅ |
| `scan:transport_deboard` | transportHandler (deboardStudent), aiHandler (stub) | ✅ |
| `scan:gate_entry` | gateHandler (arrival + notify), aiHandler (stub) | ✅ |
| `scan:gate_exit` | gateHandler (exit + notify), aiHandler (stub) | ✅ |
| `scan:attendance` | aiHandler (stub) | ⚠️ (future AI) |
| `scan.validated` | ecosystemHandler (audit + notify) | ✅ |
| `scan.rejected` | ecosystemHandler (security alert + audit), aiHandler (stub) | ✅ |
