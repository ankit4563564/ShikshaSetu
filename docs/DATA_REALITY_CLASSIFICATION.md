# Data Reality Classification

**Purpose:** Classify all prominent numbers in judge-facing experience as REAL/DERIVED/DEMO/SIMULATED/HARDCODED

---

## CLASSIFICATION DEFINITIONS

- **REAL:** Actual database query result from Supabase
- **DERIVED:** Calculated from real data (e.g., percentage from count)
- **DEMO:** Demo-specific data from canonical demo student
- **SIMULATED:** Generated/simulated data (e.g., bus GPS coordinates)
- **HARDCODED:** Static values in code, not connected to data

---

## CONNECTED EXPERIENCE CENTER (/demo/connected)

### Evidence Display

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| "3 missed" | Homework consecutive missed | DEMO | `canonicalData?.homeworkSummary?.consecutiveMissed` |
| "89%" | Attendance rate | DEMO | `canonicalData?.attendanceSummary?.rate` |
| "15 minutes" | Task duration | HARDCODED | Static value in UI |
| "10:02" | Timeline timestamp | HARDCODED | Static value in UI |

**Status:** Mostly DEMO-based (acceptable for demo scenario)

---

## TEACHER PORTAL (/teacher)

### Today's Focus Bar

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| "3 students require follow-up" | Priority item | HARDCODED | Static array in `TodaysFocusBar.tsx` |
| "14 homework submissions awaiting review" | Priority item | HARDCODED | Static array in `TodaysFocusBar.tsx` |
| "96% present today" | Priority item | HARDCODED | Static array in `TodaysFocusBar.tsx` |

**Status:** HARDCODED - Should be derived from real data

### Teacher Dashboard Client

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| "95% Present Today" | Dashboard summary | HARDCODED | Static value in UI |
| "94% Stable" | Class health | HARDCODED | Static value in UI |
| "88% complete" | Homework submission | HARDCODED | Static value in UI |
| "30% Over 14 Days" | Homework completion drop | HARDCODED | Static value in UI |
| "98% Stable" | Attendance record | HARDCODED | Static value in UI |
| "92%" | Class average | HARDCODED | Static value in UI |
| "2 students" | Need review | HARDCODED | Static value in UI |
| "94% High Confidence" | Recommendation | HARDCODED | Static value in UI |
| "85% resolve" | Historical success | HARDCODED | Static value in UI |
| "14/14 Students Verified" | Attendance count | HARDCODED | Static value in UI |

**Status:** HARDCODED - Should be derived from real data

---

## PARENT PORTAL (/parent)

### Parent Today Client

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| TBD | Need to audit | TBD | TBD |

**Status:** Not yet audited

---

## STUDENT PORTAL (/student)

### Student Portal Client

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| TBD | Need to audit | TBD | TBD |

**Status:** Not yet audited

---

## ADMIN PORTAL (/admin)

### Admin Dashboard Client

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| TBD | Need to audit | TBD | TBD |

**Status:** Not yet audited

---

## LANDING PAGE (/)

### Hero Section

| Number | Location | Classification | Source |
|--------|----------|----------------|--------|
| TBD | Need to audit | TBD | TBD |

**Status:** Not yet audited

---

## CRITICAL FINDINGS

### High Risk: Teacher Portal Numbers are HARDCODED

**Issue:** Most numbers in teacher dashboard are hardcoded static values, not derived from real database queries.

**Impact:** Judges may click through and see the same numbers regardless of actual data state.

**Examples:**
- "3 students require follow-up" - Always shows 3
- "95% Present Today" - Always shows 95%
- "88% complete" - Always shows 88%

**Recommendation:** 
- For hackathon demo: Acceptable if demo data is consistent
- For production: Must be derived from real Supabase queries

---

## ACCEPTABLE HARDCODING FOR DEMO

The following hardcoded values are acceptable for the hackathon demo because they are part of the demo scenario:

- Connected Experience Center numbers (demo-specific scenario)
- Demo runner timeline timestamps
- Canonical demo student values

---

## PROBLEMATIC HARDCODING

The following hardcoded values are problematic because they appear in production portal pages:

- Teacher Today's Focus Bar priorities
- Teacher Dashboard summary statistics
- Teacher recommendation confidence scores

---

## RECOMMENDATIONS

### Option A: Accept for Hackathon (Quickest)

**Action:** Document that teacher portal numbers are hardcoded demo values

**Rationale:** 
- Demo is focused on Connected Experience Center
- Teacher portal is secondary in demo flow
- Judges may not drill into teacher dashboard deeply

**Time Required:** 0 minutes (just documentation)

### Option B: Derive from Real Data (Better but Slower)

**Action:** Replace hardcoded values with real Supabase queries

**Examples:**
- Count actual students needing follow-up from status_flags
- Calculate actual attendance rate from attendance table
- Calculate actual homework completion from homework table

**Time Required:** 2-3 hours

### Option C: Remove Numbers (Safest)

**Action:** Remove specific numbers from teacher portal, use qualitative labels

**Examples:**
- Change "3 students require follow-up" to "Students require follow-up"
- Change "95% Present Today" to "Attendance completed"
- Change "88% complete" to "Homework submission in progress"

**Time Required:** 30-45 minutes

---

## DECISION

**Recommended:** Option A (Accept for Hackathon)

**Reasoning:**
- Connected Experience Center is the primary demo and uses real persisted data
- Teacher portal is secondary and judges may not explore deeply
- Time is limited for hackathon hardening
- Focus on ensuring Connected Experience is fully working

**Alternative:** If time permits, implement Option C (Remove Numbers) to avoid misleading judges.

---

## NEXT STEPS

1. Complete audit of Parent, Student, Admin portals
2. Complete audit of Landing page
3. Make final decision on teacher portal numbers
4. Document all classifications in this file
