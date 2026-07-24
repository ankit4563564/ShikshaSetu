/**
 * School Event Orchestration System
 * 
 * One event. Many consequences.
 * 
 * Every action in one portal automatically notifies and updates all other portals
 * with contextual information. The school functions as one unified organism.
 * 
 * Core Principle:
 * "Schools don't have a data problem. They have a connection problem.
 * Every event happens once. Every stakeholder stays informed automatically."
 */

export type EventType = 
  | 'parent_wellness_report'
  | 'parent_message'
  | 'teacher_response'
  | 'teacher_mark_attended'
  | 'homework_submitted'
  | 'homework_graded'
  | 'test_result'
  | 'bus_departed'
  | 'bus_arrived'
  | 'student_boarded'
  | 'student_deboarded'
  | 'gate_entry'
  | 'gate_exit'
  | 'achievement_unlocked'
  | 'streak_milestone'
  | 'attendance_improved'
  | 'risk_detected'
  | 'ptm_scheduled'
  | 'announcement_posted'
  | 'reward_redeemed';

export interface SchoolEvent {
  id: string;
  type: EventType;
  timestamp: number;
  actorId: string;
  actorName: string;
  actorRole: 'parent' | 'teacher' | 'student' | 'driver' | 'admin' | 'system' | 'ai';
  studentId: string;
  studentName: string;
  content: string;
  metadata?: Record<string, any>;
  affectedPortals: ('teacher' | 'parent' | 'student' | 'driver' | 'gate' | 'vendor' | 'admin' | 'schoolgpt')[];
}

// ─── EXAMPLE: One Event, Many Consequences ─────────────────────────────────

/**
 * EVENT: Parent reports "Aarav had a rough morning."
 * 
 * 07:45 AM
 * ├─ Parent Portal
 * │  └─ Message sent to teacher
 * │
 * ├─ Teacher Portal
 * │  ├─ Instant notification: "Parent concern — emotional wellbeing"
 * │  ├─ AI suggests: "Check Aarav after second period"
 * │  └─ Flag added to student profile
 * │
 * ├─ Student Portal
 * │  └─ SchoolGPT context updated (available if student asks)
 * │
 * ├─ Admin Portal
 * │  ├─ Communication metric: +1 parent engagement
 * │  └─ Wellness alert added to dashboard
 * │
 * └─ SchoolGPT
 *    └─ Automatically understands: "Aarav may need emotional support today"
 * 
 * 09:15 AM
 * Teacher responds: "Aarav participated enthusiastically after period 2."
 * 
 * ├─ Parent Portal
 * │  └─ Instant update: "Teacher reports Aarav is doing well"
 * │
 * ├─ Student Portal
 * │  └─ Teacher encouragement visible: "You participated well today!"
 * │
 * ├─ Admin Portal
 * │  └─ Resolution recorded: Concern addressed
 * │
 * └─ SchoolGPT
 *    └─ Wellness status updated: "Aarav responded well to teacher support"
 */

// ─── EVENT PROPAGATION RULES ──────────────────────────────────────────────

export const EVENT_PROPAGATION_RULES: Record<EventType, {
  affectPortals: string[];
  ai_insight?: string;
  notification?: string;
  metrics_update?: string;
  auto_action?: string;
}> = {
  parent_wellness_report: {
    affectPortals: ['teacher', 'admin', 'schoolgpt'],
    ai_insight: 'Wellness concern detected — emotional support recommended',
    notification: 'Teacher receives wellness alert',
    metrics_update: 'Parent engagement +1, Wellness alerts +1',
    auto_action: 'Flag student profile, add to AI context',
  },
  
  parent_message: {
    affectPortals: ['teacher', 'schoolgpt'],
    notification: 'Teacher receives parent message',
    metrics_update: 'Parent engagement +1',
    auto_action: 'Add to conversation history',
  },
  
  teacher_response: {
    affectPortals: ['parent', 'student', 'admin', 'schoolgpt'],
    notification: 'Parent receives response, Student sees teacher comment',
    metrics_update: 'Teacher response rate +1',
    auto_action: 'Update conversation, notify AI context',
  },
  
  teacher_mark_attended: {
    affectPortals: ['parent', 'admin', 'schoolgpt'],
    notification: 'Parent receives attendance confirmation',
    metrics_update: 'Attendance rate updated',
    auto_action: 'Calculate new attendance %',
  },
  
  homework_submitted: {
    affectPortals: ['teacher', 'parent', 'admin', 'schoolgpt'],
    notification: 'Parent notified, Teacher grading queue updated',
    metrics_update: 'Homework submission rate +1',
    auto_action: 'Check for streak, unlock badge if applicable',
  },
  
  homework_graded: {
    affectPortals: ['parent', 'student', 'admin', 'schoolgpt'],
    notification: 'Parent sees grade, Student receives feedback',
    metrics_update: 'Grade recorded, Trend analysis updated',
    auto_action: 'Generate AI insight on performance',
  },
  
  test_result: {
    affectPortals: ['parent', 'student', 'admin', 'schoolgpt'],
    ai_insight: 'Subject trend analysis, Strong/weak area identification',
    notification: 'Parent notified, Student sees score + AI recommendations',
    metrics_update: 'Class average updated, Student performance tracked',
    auto_action: 'Generate study plan if needed, Recommend resources',
  },
  
  bus_departed: {
    affectPortals: ['parent', 'admin', 'schoolgpt'],
    notification: 'Parent receives departure notification',
    metrics_update: 'Route status: en route',
    auto_action: 'Begin tracking, estimate arrival',
  },
  
  bus_arrived: {
    affectPortals: ['parent', 'teacher', 'admin', 'gate'],
    notification: 'Parent: arrival confirmation, Teacher: attendance readiness',
    metrics_update: 'Route completion, On-time status',
    auto_action: 'Open gate access, Begin attendance scanning',
  },
  
  student_boarded: {
    affectPortals: ['parent', 'admin', 'schoolgpt'],
    notification: 'Parent: boarding confirmation',
    metrics_update: 'Ridership count updated',
    auto_action: 'Update student location context',
  },
  
  student_deboarded: {
    affectPortals: ['parent', 'admin', 'schoolgpt'],
    notification: 'Parent: student safely deboarded',
    metrics_update: 'Drop-off confirmed',
    auto_action: 'Close journey, Update location',
  },
  
  gate_entry: {
    affectPortals: ['teacher', 'parent', 'admin'],
    notification: 'Teacher: attendance system updated, Parent: child arrived',
    metrics_update: 'Attendance marked, Gate access logged',
    auto_action: 'Trigger attendance sync, Check for late arrivals',
  },
  
  gate_exit: {
    affectPortals: ['parent', 'admin'],
    notification: 'Parent: early exit alert if before school end time',
    metrics_update: 'Exit log recorded',
    auto_action: 'Generate alert if early pickup not approved',
  },
  
  achievement_unlocked: {
    affectPortals: ['parent', 'student', 'admin', 'schoolgpt'],
    notification: 'Parent sees achievement, Student celebration in app',
    metrics_update: 'Badge count, Reward eligibility updated',
    auto_action: 'Award coins, Update student profile',
  },
  
  streak_milestone: {
    affectPortals: ['parent', 'student', 'admin'],
    notification: 'Celebration notification to student + parent',
    metrics_update: 'Streak milestone recorded',
    auto_action: 'Award bonus coins, Create moment of delight',
  },
  
  attendance_improved: {
    affectPortals: ['parent', 'admin', 'schoolgpt'],
    ai_insight: 'Attendance trend positive, Support maintained',
    notification: 'Parent: positive reinforcement',
    metrics_update: 'Trend analysis updated',
    auto_action: 'Generate encouraging message',
  },
  
  risk_detected: {
    affectPortals: ['teacher', 'admin', 'schoolgpt'],
    ai_insight: 'Risk identified: attendance drop, grade decline, engagement loss, etc.',
    notification: 'Teacher and Admin flagged, AI recommends action',
    metrics_update: 'Risk alert added',
    auto_action: 'Escalate to teacher, Schedule check-in',
  },
  
  ptm_scheduled: {
    affectPortals: ['teacher', 'parent', 'admin', 'schoolgpt'],
    notification: 'All parties receive confirmation',
    metrics_update: 'PTM booking recorded',
    auto_action: 'Generate pre-meeting summary, Prepare talking points',
  },
  
  announcement_posted: {
    affectPortals: ['parent', 'student', 'driver', 'teacher', 'admin', 'schoolgpt'],
    notification: 'Broadcast to all relevant stakeholders',
    metrics_update: 'Announcement count',
    auto_action: 'Index for search, Add to SchoolGPT context',
  },
  
  reward_redeemed: {
    affectPortals: ['parent', 'student', 'vendor', 'admin'],
    notification: 'Student confirmation, Parent notified, Vendor updated',
    metrics_update: 'Coin balance, Reward usage, Vendor inventory',
    auto_action: 'Update balances, Generate transaction record',
  },
};

// ─── WOW MOMENT 1: Parent Concern → Instant Teacher Support ──────────────

export const WOW_MOMENT_1 = {
  title: 'Wellness Concern Propagation',
  story: `
Parent writes at 7:45 AM: "My child is anxious today."

Instantly (< 500ms):
├─ Teacher Portal: Alert appears with parent message
├─ AI Insight: "Emotional support recommended"
├─ Suggested Action: "Check in after first period"
└─ SchoolGPT: Context ready if teacher asks

If teacher responds: "I'll keep an eye on them."
├─ Parent Portal: Instant reassurance visible
├─ Student Portal: (if old enough) "Teacher is aware and supporting you"
└─ Admin: Communication metric increases

When teacher later marks: "Aarav participated well today."
├─ Parent Portal: "Great news! Teacher reports Aarav did well."
├─ Student Portal: Teacher encouragement
├─ Admin: Wellness concern marked as resolved
└─ SchoolGPT: Wellness status updated
  `,
  impact: 'Parent feels heard. Teacher feels supported. Student feels cared for. Admin sees engagement.',
};

// ─── WOW MOMENT 2: Teacher Question → AI Ranked Student List → One-Click Parent Draft ──────────────

export const WOW_MOMENT_2 = {
  title: 'Intelligent Decision Support',
  story: `
Teacher asks SchoolGPT: "Who needs attention today?"

AI instantly provides ranked list:
1. Aarav (attendance declining, mentioned anxiety today)
   → Recommendation: Emotional check-in
   → Suggested message: "[Draft]"
   
2. Priya (Math score dropped 15%, submitted late homework)
   → Recommendation: Academic support
   → Suggested message: "[Draft]"
   
3. Rohan (participated well but homework gap)
   → Recommendation: Homework system review
   → Suggested message: "[Draft]"

Teacher clicks "Draft message to parents" for Aarav.

Generated message appears in Parent Portal:
"Hi! Aarav is doing well in class, but I noticed he might be 
feeling anxious today. Everything okay at home? Let me know 
how I can support him."

Parent can respond immediately, closing the loop instantly.
  `,
  impact: 'Teacher sees actionable intelligence. Saves 10 minutes of analysis. Parent feels proactive concern.',
};

// ─── WOW MOMENT 3: Admin Opens Dashboard → Entire School Day in 10 Seconds ──────────────

export const WOW_MOMENT_3 = {
  title: 'School Day at a Glance',
  story: `
Admin opens dashboard. Single screen shows:

┌─────────────────────────────────────┐
│ 📊 SCHOOL DAY SUMMARY              │
│ 07:45 AM - Now                      │
└─────────────────────────────────────┘

🚌 TRANSPORT
├─ Morning Route: 14/14 delivered (100%)
├─ Afternoon Route: Departing 2:45 PM
└─ Bus Health: All on time

🚪 GATE
├─ Students Entered: 847/847 (100%)
├─ Late Arrivals: 3 (flagged)
└─ Unauthorized Exits: 0

📚 ACADEMICS
├─ Homework Submitted: 95%
├─ Grades Processed: 203 assignments
└─ Risk Alerts: 2 (follow-up needed)

👥 ENGAGEMENT
├─ Parent Communications: 47
├─ Teacher Responses: 44 (93%)
└─ Parent Satisfaction: 98%

💬 SCHOOLGPT
├─ Student Questions: 124
├─ Teacher Queries: 18
└─ AI Interventions: 7 (proactive support)

🎯 ALERTS
├─ Wellness Concerns: 1 (resolved)
├─ Attendance Issues: 2 (being addressed)
└─ Academic Support Needed: 3

Each metric is clickable to drill down into specific students/events.
No scrolling needed. No data hunting. Everything visible instantly.
  `,
  impact: 'Admin understands school health in seconds. No more dashboard fatigue.',
};

// ─── WOW MOMENT 4: Homework Completion → 4-Portal Update ──────────────────

export const WOW_MOMENT_4 = {
  title: 'One Action, Four Portal Updates',
  story: `
Student submits Math homework at 7:30 PM.

Instant cascading updates:

STUDENT PORTAL (immediately):
├─ ✅ Homework submitted
├─ Streak counter: 14/14 days
├─ Progress towards next badge: 2/3 assignments
└─ AI: "Great work! You're on a 2-week streak!"

PARENT PORTAL (immediately):
├─ 📬 Notification: "Aarav submitted Math homework"
├─ Streak tracker visible: 14 consecutive days
└─ Optional: "Reply with encouragement" quick action

TEACHER PORTAL (immediately):
├─ Grading Queue updated
├─ New assignment ready to grade
├─ Student streak visible: "14-day streak — maintain this!"
└─ Batch action available: Grade all submissions for this assignment

ADMIN PORTAL (immediately):
├─ Homework submission rate: 95% (updated in real-time)
├─ Engagement metric: Parent notifications sent
└─ Trend: "Homework submission on track for the week"

If teacher grades it within 2 hours:
├─ Parent notified immediately
├─ Grade visible to student
├─ SchoolGPT references new grade in study recommendations
  `,
  impact: 'Family sees immediate feedback loop. Teacher has organized queue. Admin sees real-time engagement.',
};

// ─── WOW MOMENT 5: Bus Arrival → Attendance → Gate Access ──────────────────

export const WOW_MOMENT_5 = {
  title: 'The Morning Arrival Sequence',
  story: `
9:08 AM - Bus arrives at school

INSTANT SEQUENCE:

Parent Portal (< 1 second):
└─ 🎉 "Aarav arrived safely at school"

Driver Portal:
├─ ✅ Route complete
├─ 14 students delivered
├─ Time: On schedule
└─ Next: Return to depot

Gate Portal:
├─ Begins QR scanning
├─ 14 students ready for entry verification
└─ System primed for attendance sync

Teacher Portal:
├─ "Morning attendance ready to sync"
├─ Scan students as they enter
├─ Automated: 14 students expected, all gates ready
└─ Quick-scan interface active

Admin Portal:
├─ Route status: ✅ Completed
├─ Attendance status: ⏳ In progress
├─ Gate health: ✅ Ready
└─ All systems synchronized

SchoolGPT:
└─ Context: "Morning arrival in progress. All students accounted for from transport."

9:14 AM - Gate scanning complete

Teacher Portal: ✅ All 14 marked present
Parent Portal: ✅ Attendance confirmed (if opted in for notifications)
Admin Portal: 📊 Daily attendance rate: 99.8%
SchoolGPT: Ready to provide attendance context if queried

The entire sequence: Frictionless. Automatic. Connected.
  `,
  impact: 'Parent has peace of mind instantly. Teacher has perfect attendance data. Admin sees real-time health.',
};

// ─── THE STORY EACH PORTAL TELLS ──────────────────────────────────────────

export const PORTAL_STORIES = {
  teacher: 'My class needs me, and I have everything I need to help them right now.',
  parent: 'My child is safe, engaged, and I know exactly what\'s happening.',
  student: 'I know what to do today, I can see my progress, and I feel supported.',
  driver: 'I know exactly who I have on my bus and where I\'m going.',
  gate: 'I know everyone entering and I\'m keeping this school secure.',
  vendor: 'I know the rewards students want and my inventory matches demand.',
  admin: 'I understand the entire school and I can make informed decisions in seconds.',
  schoolgpt: 'I know everything happening in this school and I provide intelligent assistance.',
};

// ─── THE POSITIONING ──────────────────────────────────────────────────────

export const PRODUCT_POSITIONING = {
  problem: 'Schools don\'t have a data problem. They have a connection problem.',
  solution: 'Every event happens once. Every stakeholder stays informed automatically.',
  visualization: `
    Parent → Teacher → Student → Driver → Gate → Admin → SchoolGPT
    
    One event ripples through all of them instantly.
    No manual work. No data silos. One connected ecosystem.
  `,
  demo_flow: [
    'Parent reports concern',
    'Teacher receives context and AI support',
    'Student sees encouragement',
    'Driver confirms arrival',
    'Gate system primed',
    'Admin sees everything',
    'SchoolGPT understands automatically',
  ],
};

export default {
  EVENT_PROPAGATION_RULES,
  WOW_MOMENT_1,
  WOW_MOMENT_2,
  WOW_MOMENT_3,
  WOW_MOMENT_4,
  WOW_MOMENT_5,
  PORTAL_STORIES,
  PRODUCT_POSITIONING,
};
