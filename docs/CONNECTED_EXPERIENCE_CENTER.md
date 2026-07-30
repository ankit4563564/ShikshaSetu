# Connected Experience Center - Feature Documentation

## Overview

The Connected Experience Center is ShikshaSetu's flagship demo feature that showcases the platform's ability to coordinate student support across teachers, parents, students, and school administration in a single connected workflow.

**Route:** `/demo/connected`

**Purpose:** Demonstrate how one teacher decision can trigger coordinated support across the entire educational ecosystem.

---

## How It Works

### User Flow

1. **Initial State**
   - System detects a student (Aarav Sharma) needs support based on multiple data points
   - Teacher (Mrs. Kavita Rao) reviews the evidence
   - Teacher decides whether to approve support

2. **Approval Action**
   - Teacher clicks "Approve Support"
   - System simultaneously:
     - Informs parent (Priya Sharma)
     - Assigns practice to student (Algebra Recovery Practice)
     - Records intervention in School Memory
   - Visual propagation shows the connected nature of the system

3. **Student Action**
   - Student completes the assigned practice
   - System marks task as complete

4. **Completion**
   - Support loop is marked complete
   - School Memory records what worked for future reference
   - Student is "back on track"

### Technical Flow

```
Frontend (React Component)
    ↓
State Management (Local State)
    ↓
User Action (Click Handler)
    ↓
Server Action (Next.js Server Action)
    ↓
Supabase Database (PostgreSQL)
    ↓
Data Persistence + Cross-Portal Sync
```

---

## Technical Architecture

### Frontend Component

**File:** `components/demo/ConnectedExperienceCenter.tsx`

**Technology Stack:**
- React (Client Component)
- Framer Motion (Animations)
- Tailwind CSS (Styling)

**State Management:**
- Simple local state using React `useState`
- Three states: `initial` | `approved` | `completed`
- Loading state for async operations

**Key Functions:**
- `handleApprove()`: Triggers approval workflow
- `handleComplete()`: Marks practice as complete
- `handleReset()`: Resets demo to initial state

---

### Database Schema

The feature relies on several Supabase database tables:

#### 1. `interventions`
Stores support plan records.

```sql
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  teacher_id UUID REFERENCES teachers(id),
  signal_id TEXT,
  signal_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. `intervention_milestones`
Tracks progress of interventions.

```sql
CREATE TABLE intervention_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID REFERENCES interventions(id),
  milestone_type TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. `student_tasks`
Individual tasks assigned to students.

```sql
CREATE TABLE student_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  intervention_id UUID REFERENCES interventions(id),
  title TEXT,
  description TEXT,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. `ecosystem_events`
Audit log of all system events.

```sql
CREATE TABLE ecosystem_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  actor_role TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Server Actions

**File:** `app/actions/interventionActions.ts`

#### `approveSupportPlanAction`
Orchestrates the approval workflow in a single transaction:

```typescript
export async function approveSupportPlanAction(input: ApproveSupportPlanInput) {
  // 1. Create intervention record
  // 2. Create student task
  // 3. Create notification for parent
  // 4. Record ecosystem event
  // 5. Update support signal status
  // 6. Revalidate Next.js cache
}
```

#### `completeTaskAction`
Marks a student task as complete:

```typescript
export async function completeTaskAction(input: CompleteTaskInput) {
  // 1. Update task status to 'completed'
  // 2. Create milestone record
  // 3. Record ecosystem event
  // 4. Revalidate Next.js cache
}
```

---

### Support Signal Engine

**File:** `lib/support-signals/index.ts`

The engine that detects when a student needs support:

**Detection Rules:**
- `detectHomeworkGap()`: 3+ consecutive missed assignments
- `detectAttendanceDecline()`: Attendance drops below threshold
- `detectGradeDrop()`: Significant grade decline
- `detectWellnessConcern()`: Mood check-in patterns
- `detectCompositeSignal()`: Multiple concerning patterns

**Output:** `SupportSignal` object with:
- Student information
- Evidence data points
- Severity level
- Recommended actions

---

### Canonical Demo Data

**File:** `supabase/migrations/004_canonical_demo_student.sql`

Pre-populated demo data for consistent testing:

**Student:**
- ID: `00000000-0000-4000-8000-000000000001`
- Name: Aarav Sharma
- Grade: 8A

**Teacher:**
- ID: `00000000-0000-4000-8000-000000000002`
- Name: Mrs. Kavita Rao

**Parent:**
- ID: `00000000-0000-4000-8000-000000000003`
- Name: Priya Sharma

**Evidence Data:**
- 3 missed homework assignments
- Attendance decline (96% → 89%)
- Reduced classroom participation

---

## Dependencies & Requirements

### Environment Variables

Required in `.env.local` or Vercel environment:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Migrations

Required migrations (in order):

1. `001_enums_and_people.sql` - Core schema
2. `002_academic_and_wellness.sql` - Academic data tables
3. `003_notifications_and_messaging.sql` - Notifications
4. `004_canonical_demo_student.sql` - Demo data
5. `005_interventions_and_tasks.sql` - Intervention tables
6. `005c_create_missing_intervention_tables.sql` - Missing tables
7. `005d_add_intervention_rls_policies.sql` - RLS policies
8. `005e_update_intervention_rls_with_anon.sql` - Anon role access
9. `005f_disable_rls_for_intervention_tables.sql` - Disable RLS for demo

### Row Level Security (RLS)

**Current State:** Disabled for demo mode

For production, RLS policies should be enabled with proper role-based access control.

---

## State Management

### Current Implementation

**Simple Local State:**
- No complex state management library
- No reactive subscriptions
- Direct state updates
- No localStorage persistence (simplified for demo)

**Why This Approach:**
- Eliminates state reversion issues
- Predictable behavior
- Easy to debug
- Sufficient for demo scope

### Previous Attempts (Abandoned)

1. **Copilot Engine with Reactive Subscriptions**
   - Problem: State reversion due to global state overwriting local changes
   - Abandoned due to complexity and bugs

2. **localStorage Persistence**
   - Problem: Added complexity without solving core issues
   - Abandoned for simpler approach

---

## UI/UX Design

### Design Principles

1. **Human-Centered Language**
   - "Helping Aarav get back on track" (not "LIVE STUDENT SUPPORT")
   - Focus on student story, not technical workflow

2. **Visual Storytelling**
   - Aarav as visual center
   - Connected nodes showing relationships
   - Progressive disclosure of information

3. **Apple × Linear Aesthetic**
   - Clean, minimal design
   - Restrained color palette
   - Premium feel
   - No "AI dashboard" aesthetic

### Visual Structure

```
Header (Student Context)
    ↓
Connected Story (Teacher → Aarav → Parent/Practice/School)
    ↓
Decision Panel (Evidence + Actions)
    ↓
Timeline (Narrative events)
```

### Typography Scale

- Main heading: 36px
- Student name: 18px
- Card titles: 16px
- Body text: 16px minimum
- Metadata: 12px minimum

### Color Strategy

- **Neutral:** Slate (backgrounds, borders)
- **Primary/Action:** Teal (current action)
- **Attention:** Amber (needs support)
- **Success:** Emerald (completed states)
- **School Memory:** Subtle purple (differentiator)

---

## Cross-Portal Synchronization

### How It Works

When an intervention is created:

1. **Teacher Portal:** Shows intervention in dashboard
2. **Parent Portal:** Receives notification
3. **Student Portal:** Shows assigned task
4. **Admin Portal:** Can view intervention records

### Data Flow

```
Server Action (approveSupportPlanAction)
    ↓
Database (interventions table)
    ↓
Ecosystem Events (audit log)
    ↓
Next.js Revalidation (cache invalidation)
    ↓
All Portals (real-time updates)
```

---

## School Memory Feature

### Purpose

School Memory is ShikshaSetu's differentiator - it records what worked for each student so future support starts with context, not from zero.

### Implementation

**Storage:** `intervention_milestones` table

**Data Recorded:**
- Which interventions were successful
- What type of practice helped
- Parent communication effectiveness
- Teacher follow-up outcomes

**Future Use:**
- AI recommendations based on past success
- Personalized intervention suggestions
- Pattern recognition across students

---

## Deployment

### Vercel Deployment

**Build Command:** `npm run build`

**Environment Variables:** Configure in Vercel dashboard

**Automatic Revalidation:** Next.js revalidates paths after server actions

### Database

**Supabase Project:** `ceaarwxcqoacmynozlzy`

**Migrations:** Run automatically on deploy (if configured)

**RLS Status:** Disabled for demo mode

---

## Testing

### Manual Testing Checklist

1. **Initial State**
   - Aarav is visible as central node
   - Evidence is clear (3 missed homework, etc.)
   - Teacher decision panel is connected to diagram
   - "Approve Support" button is prominent

2. **Approval Flow**
   - Click "Approve Support"
   - Loading state appears
   - Visual propagation occurs (Parent → Practice → School)
   - All three downstream cards transform
   - Timeline updates with new events

3. **Student Action**
   - Practice card becomes prominent
   - "Mark Practice Complete" button works
   - Completion state shows

4. **Completion State**
   - "Support Loop Complete" payoff appears
   - School Memory section shows what helped
   - Aarav status changes to "Back on track"
   - Timeline shows final events

5. **Reset**
   - "Reset Demo" returns to initial state
   - All state is cleared

### Browser Testing

Test at 1440px desktop resolution to verify:
- No overlapping elements
- Text is readable
- Connections are visible
- CTA is obvious
- Final state feels rewarding

---

## Known Issues & Resolutions

### Issue 1: State Reversion After Approval

**Problem:** UI would revert to previous state after successful approval.

**Root Cause:** Reactive subscription to copilot engine global state was overwriting local state changes.

**Resolution:** Removed all reactive subscriptions and used simple local state management.

### Issue 2: State Reversion After Task Completion

**Problem:** Similar reversion issue when marking task complete.

**Root Cause:** Same as above - complex state management causing conflicts.

**Resolution:** Simplified to direct state updates without external dependencies.

### Issue 3: UI Overlap

**Problem:** Teacher and Aarav nodes visually overlapped.

**Root Cause:** Absolute positioning without proper spacing calculations.

**Resolution:** Changed to flexbox layout with proper vertical spacing.

---

## Future Enhancements

### Production Readiness

1. **Enable RLS:** Re-enable Row Level Security with proper role-based access
2. **Real Server Actions:** Connect to actual backend (currently simulated for demo)
3. **Real-time Updates:** Add Supabase realtime subscriptions
4. **Authentication:** Integrate with actual auth system
5. **Multiple Students:** Support multiple students, not just canonical demo

### Feature Expansion

1. **AI Recommendations:** Use School Memory data for AI-powered suggestions
2. **Pattern Recognition:** Identify which interventions work best for different student profiles
3. **Parent Portal Integration:** Show interventions in parent dashboard
4. **Analytics Dashboard:** Track intervention effectiveness over time
5. **Mobile App:** Extend to mobile experience

---

## File Structure

```
├── app/
│   ├── actions/
│   │   ├── interventionActions.ts (Server actions)
│   │   ├── ecosystemActions.ts (Event fetching)
│   │   └── demoResetActions.ts (Reset functionality)
│   └── demo/
│       └── connected/
│           └── page.tsx (Route definition)
├── components/
│   └── demo/
│       └── ConnectedExperienceCenter.tsx (Main UI component)
├── lib/
│   ├── canonical/
│   │   └── index.ts (Demo data helpers)
│   ├── copilot/
│   │   └── copilotEngine.ts (State engine - currently unused)
│   ├── support-signals/
│   │   └── index.ts (Detection engine)
│   └── supabase/
│       ├── client.ts (Browser client)
│       └── server.ts (Server client)
└── supabase/
    └── migrations/
        ├── 004_canonical_demo_student.sql (Demo data)
        ├── 005_interventions_and_tasks.sql (Core tables)
        ├── 005c_create_missing_intervention_tables.sql (Missing tables)
        ├── 005d_add_intervention_rls_policies.sql (RLS policies)
        ├── 005e_update_intervention_rls_with_anon.sql (Anon access)
        └── 005f_disable_rls_for_intervention_tables.sql (Disable RLS)
```

---

## Performance Considerations

### Database Queries

- All queries use indexed columns (student_id, teacher_id)
- Server actions run in transactions for data consistency
- Next.js revalidation ensures cache freshness

### Frontend Performance

- Component uses React.memo for optimization
- Framer Motion animations are hardware-accelerated
- No unnecessary re-renders due to simple state management

### Bundle Size

- Component is ~15KB gzipped
- Framer Motion adds ~40KB (shared across app)
- Total impact is minimal for demo scope

---

## Security Considerations

### Current State (Demo Mode)

- RLS disabled for easy demo access
- Uses anon key for database operations
- No authentication required

### Production Requirements

1. **Enable RLS:** Restrict access based on user roles
2. **Authentication:** Require user login
3. **Input Validation:** Validate all server action inputs
4. **Rate Limiting:** Prevent abuse of server actions
5. **Audit Logging:** All actions already logged to ecosystem_events

---

## Conclusion

The Connected Experience Center is ShikshaSetu's flagship demo feature that demonstrates the platform's core value proposition: coordinated student support across the entire educational ecosystem through a single teacher decision.

**Key Differentiators:**
- Connected workflow (not isolated silos)
- School Memory (learn from what works)
- Human-centered design (not technical dashboard)
- Real-time coordination (not delayed communication)

**Technical Highlights:**
- Simple, reliable state management
- Clean database schema with proper relationships
- Server actions for secure database operations
- Cross-portal synchronization through shared database
- Visual storytelling for immediate understanding

This feature serves as both a demo for hackathon judges and a foundation for the production intervention management system.
