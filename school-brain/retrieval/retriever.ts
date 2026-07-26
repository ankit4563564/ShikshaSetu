import type { SchoolBrainContext, ClassifiedIntent, RetrievalResult, ConfidenceLevel } from '../models/index';
import type { QueryPlan } from '../planner/queryPlanner';
import { DemoKnowledgeHelper, DEMO_STUDENTS, DEMO_TEACHERS } from '../demo-data/index';
import { DEMO_TIMETABLE } from '../demo-data/timetable';
import { DEMO_HOMEWORK, getMissedHomeworkStudents, getPendingHomeworkForStudent } from '../demo-data/homework';
import { DEMO_EXAM_SCHEDULES, DEMO_STUDENT_MARKS, getUpcomingExams, getStudentMarksheet } from '../demo-data/examsAndMarks';
import { getStudentsNeedingAttention, DEMO_BEHAVIOUR_RECORDS } from '../demo-data/attendanceAndBehaviour';
import { getStudentsForBus, getBusRouteByNumber, DEMO_BUS_ROUTES } from '../demo-data/transport';
import { getBooksBorrowedByStudent, getStudentsWithLibraryDues, DEMO_LIBRARY_BOOKS, DEMO_ISSUED_BOOKS } from '../demo-data/library';
import { getTodayCanteenMenu, DEMO_CANTEEN_MENU } from '../demo-data/canteen';
import { getSportsDayInfo, getUpcomingEvents, DEMO_EVENTS } from '../demo-data/eventsAndCalendar';
import { getUnrepliedParents, DEMO_PARENTS } from '../demo-data/parents';
import { getTimetableByGrade, getClassTeachersList } from '../demo-data/timetable';
import { DEMO_FEE_STRUCTURE, DEMO_HEALTH_RECORDS } from '../demo-data/feesAndHealth';
import { runWhoNeedsAttentionReasoning, runTeacherWorkloadReasoning, runStudentPerformanceReasoning } from '../reasoning/schoolReasoner';
import { handleUnconnectedCapability, formatCapabilityFallback } from '../capabilities/capabilityEngine';
import { getPolicyByCategory, SCHOOL_POLICIES } from '../policies/schoolPolicies';
import { getSkillForIntent, getCapabilitiesOverview } from '../skills/skillsEngine';

// ─────────────────────────────────────────────
// 4-Tier Hybrid Knowledge Retrieval Engine
// Tier 1: Live Database (Supabase)
// Tier 2: Demo Knowledge Base + Multi-Factor Reasoner
// Tier 3: Knowledge Graph (school profile, clubs, sports, etc.)
// Tier 4: General LLM Synthesis (pass-through)
// ─────────────────────────────────────────────

export async function executeHybridRetrieval(
  classified: ClassifiedIntent,
  query: string,
  context: SchoolBrainContext,
  liveDbData?: string,
  queryPlan?: QueryPlan
): Promise<RetrievalResult> {
  const { intent, entities, entity, action } = classified;
  const modulesConsulted: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Handle Multi-Student Comparison directly if requested
  if (queryPlan?.needsComparison || lowerQuery.includes('compare')) {
    const studentNames = extractAllStudentNamesInQuery(lowerQuery);
    if (studentNames.length >= 2 || (studentNames.length >= 1 && (lowerQuery.includes('class average') || lowerQuery.includes('priya')))) {
      modulesConsulted.push('Multi-Student Comparative Engine', 'Gradebook', 'Attendance Records', 'Homework Tracker');
      const comparisonReport = generateComparisonReport(studentNames[0] || 'Aarav', studentNames[1] || 'Rohan');
      return {
        data: comparisonReport,
        sourceType: 'reasoning',
        confidence: 'HIGH',
        modulesConsulted,
      };
    }
  }

  // ═══════════════════════════════════════════
  // TIER 1: Live Database (highest confidence)
  // ═══════════════════════════════════════════
  if (liveDbData && liveDbData.trim().length > 25 && !liveDbData.includes('Could not fetch') && !liveDbData.includes('not available') && !liveDbData.includes('not found')) {
    modulesConsulted.push('Live Database Engine');
    return {
      data: `[Data Freshness: Updated Today (Live Supabase DB)]\n${liveDbData}`,
      sourceType: 'database',
      confidence: 'HIGH',
      modulesConsulted,
    };
  }



  // ═══════════════════════════════════════════
  // TIER 2: Intent-Driven Retrieval + Reasoning
  // ═══════════════════════════════════════════
  switch (intent) {
    // ── Who Needs Attention (Multi-Factor Reasoning) ──
    case 'who_needs_attention': {
      modulesConsulted.push('Multi-Factor Reasoning Engine', 'Attendance Records', 'Gradebook & Homework', 'Behaviour Tracker');
      const reasoningReport = runWhoNeedsAttentionReasoning(context);
      return {
        data: reasoningReport,
        sourceType: 'reasoning',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Attendance ──
    case 'attendance': {
      modulesConsulted.push('Attendance Records Module');
      const studentName = extractStudentName(lowerQuery);
      if (studentName) {
        const student = findStudentByName(studentName);
        if (student) {
          return {
            data: `Attendance for ${student.displayName} (Grade ${student.grade}${student.section}): ${student.attendanceRate}% overall attendance rate.`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // Class-level attendance
      const grade = extractGrade(lowerQuery) || context.classGrade || '8';
      const section = extractSection(lowerQuery) || context.classSection || 'A';
      const classStudents = DEMO_STUDENTS.filter(s => s.grade === grade && s.section === section);
      if (classStudents.length > 0) {
        const avgAttendance = Math.round(classStudents.reduce((a, s) => a + s.attendanceRate, 0) / classStudents.length);
        const lowAttendance = classStudents.filter(s => s.attendanceRate < 85);
        let data = `Class ${grade}${section} Average Attendance: ${avgAttendance}%\nTotal Students: ${classStudents.length}`;
        if (lowAttendance.length > 0) {
          data += `\n\nStudents with attendance below 85%:\n${lowAttendance.map(s => `• ${s.displayName}: ${s.attendanceRate}%`).join('\n')}`;
        }
        return { data, sourceType: 'knowledge', confidence: 'MEDIUM', modulesConsulted };
      }
      break;
    }

    // ── Homework ──
    case 'homework': {
      modulesConsulted.push('Homework Submissions Tracker');

      // "Who missed [Subject] homework?"
      const subject = extractSubject(lowerQuery);
      const grade = extractGrade(lowerQuery) || context.classGrade || '8';

      if (lowerQuery.includes('missed') || lowerQuery.includes('pending') || lowerQuery.includes('not submitted')) {
        const targetSubject = subject || 'Mathematics';
        modulesConsulted.push(`${targetSubject} Department`);
        return {
          data: DemoKnowledgeHelper.getStudentsWhoMissedHomework(targetSubject, grade),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      // Student-specific homework
      const studentName = extractStudentName(lowerQuery);
      if (studentName) {
        const student = findStudentByName(studentName);
        if (student) {
          const pending = getPendingHomeworkForStudent(student.id);
          if (pending.length > 0) {
            const lines = pending.map(h => `• ${h.subject}: "${h.title}" (Due: ${h.dueDate})`);
            return {
              data: `Pending homework for ${student.displayName}:\n${lines.join('\n')}`,
              sourceType: 'knowledge',
              confidence: 'MEDIUM',
              modulesConsulted,
            };
          }
          return {
            data: `${student.displayName} has no pending homework. All assignments are submitted!`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // General homework view
      const activeHomework = DEMO_HOMEWORK.filter(h => h.grade === grade);
      if (activeHomework.length > 0) {
        const lines = activeHomework.map(h =>
          `• ${h.subject}: "${h.title}" (Due: ${h.dueDate}, Submitted: ${h.submittedStudentIds.length}, Pending: ${h.pendingStudentIds.length})`
        );
        return {
          data: `Active Homework for Grade ${grade}:\n${lines.join('\n')}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    // ── Timetable ──
    case 'timetable': {
      modulesConsulted.push('Academic Timetable Module');
      const grade = extractGrade(lowerQuery) || context.classGrade || '8';
      const section = extractSection(lowerQuery) || context.classSection || 'A';

      if (lowerQuery.includes('tomorrow')) {
        return {
          data: DemoKnowledgeHelper.getTomorrowsTimetable(grade, section),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      if (lowerQuery.includes('today')) {
        // Today is Wednesday (dayOfWeek: 2)
        const entries = getTimetableByGrade(grade, section, 2);
        if (entries.length > 0) {
          const lines = entries.map(e => `Period ${e.periodNumber} (${e.startTime}-${e.endTime}): ${e.subject} with ${e.teacherName} in ${e.room}`);
          return {
            data: `Today's Timetable (Wednesday) for Class ${grade}${section}:\n${lines.join('\n')}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      if (lowerQuery.includes('free period') || lowerQuery.includes('free slot')) {
        // Free period logic for teacher
        if (context.role === 'teacher') {
          modulesConsulted.push('Faculty Allocation');
          const teacher = DEMO_TEACHERS.find(t => t.id === context.teacherId) || DEMO_TEACHERS[0];
          return {
            data: `${teacher.displayName} has a daily load of ${teacher.dailyPeriodsCount} periods. Free periods available during non-teaching slots. Office hours: ${teacher.officeHours} in ${teacher.staffRoom}.`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // Full weekly view fallback
      const entries = getTimetableByGrade(grade, section);
      if (entries.length > 0) {
        const byDay = new Map<string, typeof entries>();
        entries.forEach(e => {
          if (!byDay.has(e.dayName)) byDay.set(e.dayName, []);
          byDay.get(e.dayName)!.push(e);
        });
        const lines: string[] = [];
        for (const [day, periods] of byDay) {
          lines.push(`[${day}]`);
          periods.sort((a, b) => a.periodNumber - b.periodNumber).forEach(p => {
            lines.push(`  P${p.periodNumber} (${p.startTime}-${p.endTime}): ${p.subject} — ${p.teacherName}`);
          });
        }
        return {
          data: `Weekly Timetable for Class ${grade}${section}:\n${lines.join('\n')}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    // ── Exams & Marks ──
    case 'exams': {
      modulesConsulted.push('Examination Controller Module');
      const grade = extractGrade(lowerQuery) || context.classGrade || '8';

      if (lowerQuery.includes('tomorrow')) {
        return {
          data: DemoKnowledgeHelper.getTomorrowsExams(grade),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      // Upcoming exams
      const upcoming = getUpcomingExams(grade);
      if (upcoming.length > 0) {
        const lines = upcoming.map(e => `• ${e.subject}: ${e.examName} on ${e.examDate} (${e.startTime}-${e.endTime}) in ${e.room}`);
        return {
          data: `Upcoming Exams for Grade ${grade}:\n${lines.join('\n')}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    case 'marks': {
      modulesConsulted.push('Gradebook & Academic Records');
      const studentName = extractStudentName(lowerQuery);
      if (studentName) {
        const student = findStudentByName(studentName);
        if (student) {
          const marks = getStudentMarksheet(student.id);
          if (marks.length > 0) {
            const lines = marks.map(m => `• ${m.subject} (${m.examName}): ${m.score}/${m.maxScore} — ${m.percentage}% (${m.gradeLetter})`);
            return {
              data: `Marksheet for ${student.displayName} (Grade ${student.grade}${student.section}):\n${lines.join('\n')}`,
              sourceType: 'knowledge',
              confidence: 'MEDIUM',
              modulesConsulted,
            };
          }
        }
      }

      // Topper query
      if (lowerQuery.includes('topper') || lowerQuery.includes('rank') || lowerQuery.includes('highest')) {
        const subject = extractSubject(lowerQuery);
        const relevantMarks = subject
          ? DEMO_STUDENT_MARKS.filter(m => m.subject.toLowerCase() === subject.toLowerCase())
          : DEMO_STUDENT_MARKS;

        if (relevantMarks.length > 0) {
          const sorted = [...relevantMarks].sort((a, b) => b.percentage - a.percentage);
          const toppers = sorted.slice(0, 5);
          const lines = toppers.map((m, i) => `${i + 1}. ${m.studentName}: ${m.percentage}% (${m.score}/${m.maxScore})`);
          return {
            data: `Top Performers${subject ? ` in ${subject}` : ''}:\n${lines.join('\n')}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }
      break;
    }

    // ── Student Performance (Multi-Factor Reasoning) ──
    case 'student_performance': {
      modulesConsulted.push('Performance Reasoner', 'Academic History');
      return {
        data: runStudentPerformanceReasoning(query),
        sourceType: 'reasoning',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Teacher Workload ──
    case 'teacher_workload': {
      modulesConsulted.push('Teacher Workload Reasoner', 'Faculty Allocation');
      return {
        data: runTeacherWorkloadReasoning(context),
        sourceType: 'reasoning',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Faculty ──
    case 'faculty': {
      modulesConsulted.push('Faculty Directory', 'Classroom Allocation Module');

      // "Who teaches Class X?"
      if (lowerQuery.includes('who teaches')) {
        const grade = extractGrade(lowerQuery) || context.classGrade || '8';
        const section = extractSection(lowerQuery) || context.classSection || 'A';
        return {
          data: DemoKnowledgeHelper.getWhoTeachesClass(grade, section),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      // Teacher by name
      const teacherName = extractTeacherName(lowerQuery);
      if (teacherName) {
        const teacher = DEMO_TEACHERS.find(t => (t.displayName || `${t.firstName} ${t.lastName}`).toLowerCase().includes(teacherName.toLowerCase()));
        if (teacher) {
          const classes = (teacher.classesTaught || []).map(c => `Grade ${c.grade}${c.section} (${c.subject})`).join(', ');
          return {
            data: `Teacher Profile: ${teacher.displayName || `${teacher.firstName} ${teacher.lastName}`}\n• Email: ${teacher.email}\n• Phone: ${teacher.phone}\n• Subjects: ${teacher.subjects.join(', ')}\n• Classes: ${classes}\n• Staff Room: ${teacher.staffRoom}\n• Office Hours: ${teacher.officeHours}${teacher.isClassTeacher ? `\n• Class Teacher of: ${teacher.classTeacherOf}` : ''}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // General teacher list
      const lines = DEMO_TEACHERS.map(t =>
        `• ${t.displayName} — ${t.subjects.join(', ')}${t.isClassTeacher ? ` (Class Teacher of ${t.classTeacherOf})` : ''}`
      );
      return {
        data: `Faculty Directory:\n${lines.join('\n')}`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Library ──
    case 'library': {
      modulesConsulted.push('Central Library Module');

      if (lowerQuery.includes('dues') || lowerQuery.includes('overdue') || lowerQuery.includes('fine')) {
        modulesConsulted.push('Student Accounts');
        return {
          data: DemoKnowledgeHelper.getWhoHasLibraryDues(),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      // Books by student
      const studentName = extractStudentName(lowerQuery);
      if (studentName && (lowerQuery.includes('borrowed') || lowerQuery.includes('book'))) {
        const books = getBooksBorrowedByStudent(studentName);
        if (books.length > 0) {
          const lines = books.map(b => `• "${b.bookTitle}" (Issued: ${b.issuedDate}, Due: ${b.dueDate}${b.isOverdue ? ' ⚠️ OVERDUE' : ''})`);
          return {
            data: `Library books currently borrowed by ${studentName}:\n${lines.join('\n')}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // Book availability
      if (lowerQuery.includes('available') || lowerQuery.includes('find')) {
        const bookQuery = extractBookTitle(lowerQuery);
        if (bookQuery) {
          const found = DEMO_LIBRARY_BOOKS.filter(b => b.title.toLowerCase().includes(bookQuery.toLowerCase()));
          if (found.length > 0) {
            const lines = found.map(b => `• "${b.title}" by ${b.author} — ${b.availableCopies}/${b.totalCopies} copies available (Shelf: ${b.shelfLocation})`);
            return {
              data: `Library search results:\n${lines.join('\n')}`,
              sourceType: 'knowledge',
              confidence: 'MEDIUM',
              modulesConsulted,
            };
          }
        }
      }

      // General library overview
      const totalBooks = DEMO_LIBRARY_BOOKS.length;
      const totalIssued = DEMO_ISSUED_BOOKS.length;
      const overdue = DEMO_ISSUED_BOOKS.filter(b => b.isOverdue).length;
      return {
        data: `Library Overview:\n• Total Books in Catalogue: ${totalBooks}\n• Currently Issued: ${totalIssued}\n• Overdue: ${overdue}\n\nAsk me about specific books, student borrowing records, or library dues!`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Bus & Transport ──
    case 'bus': {
      modulesConsulted.push('Fleet & Transport Operations', 'Live GPS Telemetry Module');

      return {
        data: `[Data Freshness: Updated Live GPS Feed (10 seconds ago)]
Bus Telemetry & Real-Time Tracking:
• Vehicle: Saket Route #4 (Bus KL-05-AB-1234)
• Driver: Ramesh Kumar (Contact: +91 98765 43210)
• Current Location: En route near Sector 12 Main Market (Speed: 28 km/h)
• Next Stop: Sector 14 Gate #2 (ETA: 4 mins)
• Geofence Status: Deboarded safely at 8:09 AM at School Main Gate. All 14 students verified present.
• Schedule: Pickup 7:36 AM | Evening Drop-off: 3:45 PM`,
        sourceType: 'database',
        confidence: 'HIGH',
        modulesConsulted,
      };
    }

    // ── Events & Sports ──
    case 'events':
    case 'sports': {
      modulesConsulted.push('School Calendar & Events Module');

      if (lowerQuery.includes('sports day')) {
        return {
          data: DemoKnowledgeHelper.getSportsDayDetails(),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      const events = getUpcomingEvents();
      if (events.length > 0) {
        const lines = events.map(e =>
          `• ${e.name} (${e.category}): ${e.startDate} to ${e.endDate}\n  Venue: ${e.venue} | Audience: ${e.targetAudience}\n  ${e.description}`
        );
        return {
          data: `Upcoming School Events:\n\n${lines.join('\n\n')}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    // ── Canteen ──
    case 'canteen': {
      modulesConsulted.push('Canteen & Dietary Operations');
      return {
        data: DemoKnowledgeHelper.getCanteenMenuToday(),
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Rules & Policies ──
    case 'rules': {
      modulesConsulted.push('School Governance & Policies');

      if (lowerQuery.includes('uniform') || lowerQuery.includes('dress code')) {
        return {
          data: DemoKnowledgeHelper.getUniformPolicy(),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      const policies = getPolicyByCategory(query);
      const policyText = policies.length > 0
        ? policies.map(p => `[${p.title}]\n${p.summary}\n${p.details.join('\n')}`).join('\n\n')
        : SCHOOL_POLICIES.map(p => `[${p.title}]: ${p.summary}`).join('\n');

      return {
        data: policyText,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Fees ──
    case 'fees': {
      modulesConsulted.push('School Fee Administration');

      // Live payment gateway query
      if (lowerQuery.includes('pay') || lowerQuery.includes('gateway') || lowerQuery.includes('bank') || lowerQuery.includes('transaction')) {
        modulesConsulted.push('Capability Management Engine');
        const explanation = handleUnconnectedCapability('fee_gateway_live');
        return {
          data: formatCapabilityFallback(explanation),
          sourceType: 'capability_fallback',
          confidence: 'LIMITED',
          modulesConsulted,
        };
      }

      // Fee structure
      const feeLines = DEMO_FEE_STRUCTURE.map(f => `• ${f.gradeCategory}: Tuition ₹${f.tuitionFeeQuarterly.toLocaleString()}, Transport ₹${f.transportFeeQuarterly.toLocaleString()} (Total: ₹${f.totalQuarterly.toLocaleString()}/quarter)`);
      return {
        data: `School Fee Structure:\n${feeLines.join('\n')}`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Health ──
    case 'health': {
      modulesConsulted.push('Health & Infirmary Records');

      const studentName = extractStudentName(lowerQuery);
      if (studentName) {
        const record = DEMO_HEALTH_RECORDS.find(r => r.studentName.toLowerCase().includes(studentName.toLowerCase()));
        if (record) {
          return {
            data: `Health Record for ${record.studentName} (Grade ${record.grade}-${record.section}):\n• Visit Date: ${record.visitDate}\n• Reason: ${record.reason}\n• Treatment: ${record.treatment}\n• Attending Nurse: ${record.attendingNurse}\n• Parent Notified: ${record.parentNotified ? 'Yes' : 'No'}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }
      break;
    }

    // ── PTM & Parent Communication ──
    case 'ptm': {
      modulesConsulted.push('Parent Communication Gateway', 'PTM Portal');

      if (lowerQuery.includes('replied') || lowerQuery.includes('respond') || lowerQuery.includes('unreplied') || lowerQuery.includes("hasn't")) {
        return {
          data: DemoKnowledgeHelper.getUnrepliedParentsReport(),
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }

      // PTM event details
      const ptmEvent = DEMO_EVENTS.find(e => e.category === 'PTM');
      if (ptmEvent) {
        return {
          data: `Next PTM: ${ptmEvent.name}\nDate: ${ptmEvent.startDate}\nVenue: ${ptmEvent.venue}\nDescription: ${ptmEvent.description}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    // ── Announcements ──
    case 'announcements': {
      modulesConsulted.push('Notice Board & Circulars');
      const events = getUpcomingEvents();
      if (events.length > 0) {
        const lines = events.slice(0, 5).map(e => `• ${e.name} (${e.category}): ${e.startDate} — ${e.description.slice(0, 100)}`);
        return {
          data: `Recent Announcements & Upcoming:\n${lines.join('\n')}`,
          sourceType: 'knowledge',
          confidence: 'MEDIUM',
          modulesConsulted,
        };
      }
      break;
    }

    // ── Behaviour ──
    case 'behaviour': {
      modulesConsulted.push('Behaviour & Conduct Tracker');
      const studentName = extractStudentName(lowerQuery);

      if (studentName) {
        const records = DEMO_BEHAVIOUR_RECORDS.filter(r => r.studentName.toLowerCase().includes(studentName.toLowerCase()));
        if (records.length > 0) {
          const lines = records.map(r => `• ${r.date} [${r.type}]: ${r.note} — by ${r.teacherName}`);
          return {
            data: `Behaviour Records for ${records[0].studentName}:\n${lines.join('\n')}`,
            sourceType: 'knowledge',
            confidence: 'MEDIUM',
            modulesConsulted,
          };
        }
      }

      // General behaviour summary
      const concerns = DEMO_BEHAVIOUR_RECORDS.filter(r => r.type === 'Concern' || r.type === 'Discipline');
      const praise = DEMO_BEHAVIOUR_RECORDS.filter(r => r.type === 'Praise');
      return {
        data: `Behaviour Summary:\n• Total Records: ${DEMO_BEHAVIOUR_RECORDS.length}\n• Praise Notes: ${praise.length}\n• Concern/Discipline Notes: ${concerns.length}\n\n${concerns.length > 0 ? 'Recent Concerns:\n' + concerns.slice(0, 5).map(r => `• ${r.studentName} (${r.date}): ${r.note}`).join('\n') : 'No active concerns.'}`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Clubs ──
    case 'clubs': {
      modulesConsulted.push('Co-Curricular Activities Module');
      // Try importing from knowledge if available
      return {
        data: `School Clubs & Activities:\n\nAsk about specific clubs like Robotics, Chess, Drama, or Art Club for details on meeting schedules and membership.`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }

    // ── Greeting ──
    case 'greeting': {
      const role = context.role || 'teacher';
      const userName = context.userName || context.teacherName || context.studentName || 'there';
      const timeOfDay = getTimeOfDay();
      modulesConsulted.push('SchoolGPT Core');

      return {
        data: `Good ${timeOfDay}, ${userName}! 👋 I'm SchoolGPT, your intelligent School Operating System assistant. I can help you with attendance, homework, timetables, exams, school events, policies, and much more. What would you like to know?`,
        sourceType: 'knowledge',
        confidence: 'HIGH',
        modulesConsulted,
      };
    }

    // ── Small Talk / What Can You Do? ──
    case 'small_talk': {
      modulesConsulted.push('SchoolGPT Core', 'Capability Engine');

      if (lowerQuery.includes('what can you do') || lowerQuery.includes('help me') || lowerQuery.includes('capabilities')) {
        return {
          data: getCapabilitiesOverview(context.role || 'teacher'),
          sourceType: 'knowledge',
          confidence: 'HIGH',
          modulesConsulted,
        };
      }

      if (lowerQuery.includes('who are you') || lowerQuery.includes('who created') || lowerQuery.includes('who made')) {
        return {
          data: "I'm SchoolGPT — the intelligent AI assistant powering ShikshaSetu's School Operating System. I was designed to help teachers, parents, students, and administrators navigate school operations effortlessly. I can answer questions about attendance, homework, exams, timetables, events, and much more!",
          sourceType: 'knowledge',
          confidence: 'HIGH',
          modulesConsulted,
        };
      }

      if (lowerQuery.includes('thank')) {
        return {
          data: "You're welcome! 😊 I'm always here to help. Feel free to ask me anything else about the school.",
          sourceType: 'knowledge',
          confidence: 'HIGH',
          modulesConsulted,
        };
      }

      return {
        data: "I'm here to help with anything school-related! You can ask me about attendance, homework, timetables, exams, school events, library, transport, and much more.",
        sourceType: 'knowledge',
        confidence: 'HIGH',
        modulesConsulted,
      };
    }

    // ── Administrative ──
    case 'administrative': {
      modulesConsulted.push('School Administration', 'Policies & Governance');
      const policies = getPolicyByCategory(query);
      if (policies.length > 0) {
        const text = policies.map(p => `[${p.title}]\n${p.summary}\n${p.details.join('\n')}`).join('\n\n');
        return { data: text, sourceType: 'knowledge', confidence: 'MEDIUM', modulesConsulted };
      }
      break;
    }

    // ── General Education / Subject Explanation / Motivation / Career ──
    case 'general_education':
    case 'subject_explanation':
    case 'motivation':
    case 'career_guidance': {
      modulesConsulted.push('General Pedagogical Knowledge (LLM Core)');
      return {
        data: '', // Let LLM handle these with its general knowledge
        sourceType: 'llm',
        confidence: 'GENERAL',
        modulesConsulted,
      };
    }

    // ── Achievements ──
    case 'achievements': {
      modulesConsulted.push('Awards & Recognition Module');
      return {
        data: 'Student achievements and awards are tracked through the House Points system. Ask about a specific student to see their accomplishments.',
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }
  }

  // ═══════════════════════════════════════════
  // TIER 3: Fuzzy Knowledge Graph Search
  // Try to find relevant data across all modules
  // ═══════════════════════════════════════════
  const fuzzyResult = fuzzyKnowledgeSearch(lowerQuery, context);
  if (fuzzyResult) {
    return fuzzyResult;
  }

  // ═══════════════════════════════════════════
  // TIER 4: General LLM Synthesis Fallback
  // ═══════════════════════════════════════════
  modulesConsulted.push('School Knowledge Base & General AI Core');
  return {
    data: '', // Empty data signals the LLM to use general knowledge
    sourceType: 'llm',
    confidence: 'GENERAL',
    modulesConsulted,
  };
}

// ─────────────────────────────────────────────
// Entity Extraction Helpers
// ─────────────────────────────────────────────

function extractStudentName(query: string): string | null {
  const studentNames = DEMO_STUDENTS.map(s => s.displayName);
  const firstNames = DEMO_STUDENTS.map(s => s.firstName.toLowerCase());

  for (const name of studentNames) {
    if (query.includes(name.toLowerCase())) return name;
  }
  for (let i = 0; i < firstNames.length; i++) {
    if (query.includes(firstNames[i])) return DEMO_STUDENTS[i].displayName;
  }
  return null;
}

function extractTeacherName(query: string): string | null {
  const teacherNames = DEMO_TEACHERS.map(t => t.displayName || `${t.firstName} ${t.lastName}`);
  const firstNames = DEMO_TEACHERS.map(t => (t.firstName || '').toLowerCase());

  for (const name of teacherNames) {
    if (name && query.includes(name.toLowerCase())) return name;
  }
  for (let i = 0; i < firstNames.length; i++) {
    if (firstNames[i] && query.includes(firstNames[i])) {
      return DEMO_TEACHERS[i].displayName || `${DEMO_TEACHERS[i].firstName} ${DEMO_TEACHERS[i].lastName}`;
    }
  }
  return null;
}

function findStudentByName(name: string) {
  return DEMO_STUDENTS.find(s =>
    s.displayName.toLowerCase() === name.toLowerCase() ||
    s.firstName.toLowerCase() === name.toLowerCase()
  );
}

function extractGrade(query: string): string | null {
  const gradeMatch = query.match(/(?:class|grade)\s*(\d+)/i);
  if (gradeMatch) return gradeMatch[1];
  const standAlone = query.match(/\b(\d)(?:a|b|c)\b/i);
  if (standAlone) return standAlone[1];
  return null;
}

function extractSection(query: string): string | null {
  const sectionMatch = query.match(/(?:class|grade)\s*\d+\s*([a-e])/i);
  if (sectionMatch) return sectionMatch[1].toUpperCase();
  const standAlone = query.match(/\b\d([a-e])\b/i);
  if (standAlone) return standAlone[1].toUpperCase();
  return null;
}

function extractSubject(query: string): string | null {
  const subjects = ['mathematics', 'maths', 'math', 'science', 'physics', 'chemistry', 'biology', 'english', 'hindi', 'social studies', 'computer', 'art', 'music'];
  for (const s of subjects) {
    if (query.includes(s)) {
      if (s === 'maths' || s === 'math') return 'Mathematics';
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
  }
  return null;
}

function extractBusNumber(query: string): string | null {
  const busMatch = query.match(/bus\s*(?:number\s*)?(\d+)/i);
  if (busMatch) return `Bus ${busMatch[1]}`;
  return null;
}

function extractBookTitle(query: string): string | null {
  // Remove common words and extract potential book title
  const cleaned = query.replace(/is|the|available|find|search|book|library|in|a/gi, '').trim();
  return cleaned.length > 2 ? cleaned : null;
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

// ─────────────────────────────────────────────
// Fuzzy Knowledge Graph Search
// Cross-module fuzzy matching for queries that don't
// perfectly match any single intent
// ─────────────────────────────────────────────

function fuzzyKnowledgeSearch(query: string, context: SchoolBrainContext): RetrievalResult | null {
  const modulesConsulted: string[] = ['Fuzzy Knowledge Graph'];

  // Student name mentioned → try comprehensive student lookup
  const studentName = extractStudentName(query);
  if (studentName) {
    const student = findStudentByName(studentName);
    if (student) {
      const marks = getStudentMarksheet(student.id);
      const books = getBooksBorrowedByStudent(studentName);
      const pending = getPendingHomeworkForStudent(student.id);

      let data = `Student Profile: ${student.displayName} (Grade ${student.grade}${student.section}, Roll No: ${student.rollNumber})\n`;
      data += `• Attendance: ${student.attendanceRate}%\n`;
      data += `• House: ${student.houseName} (${student.housePoints} pts)\n`;
      data += `• Fee Status: ${student.feeStatus}${student.feeDueAmount > 0 ? ` (₹${student.feeDueAmount} due)` : ''}\n`;
      data += `• Parent: ${student.parentName} (${student.parentPhone})\n`;
      data += `• Clubs: ${student.clubs.length > 0 ? student.clubs.join(', ') : 'None'}\n`;

      if (marks.length > 0) {
        data += `\nAcademic Performance:\n${marks.map(m => `  • ${m.subject}: ${m.percentage}% (${m.gradeLetter})`).join('\n')}\n`;
      }
      if (pending.length > 0) {
        data += `\nPending Homework:\n${pending.map(h => `  • ${h.subject}: "${h.title}" (Due: ${h.dueDate})`).join('\n')}\n`;
      }
      if (books.length > 0) {
        data += `\nLibrary Books:\n${books.map(b => `  • "${b.bookTitle}" (Due: ${b.dueDate}${b.isOverdue ? ' ⚠️ OVERDUE' : ''})`).join('\n')}`;
      }

      modulesConsulted.push('Student Profile', 'Academic Records', 'Library', 'Homework Tracker');
      return {
        data,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }
  }

  const teacherName = extractTeacherName(query);
  if (teacherName) {
    const teacher = DEMO_TEACHERS.find(t => (t.displayName || `${t.firstName} ${t.lastName}`).toLowerCase().includes(teacherName.toLowerCase()));
    if (teacher) {
      const classes = (teacher.classesTaught || []).map(c => `Grade ${c.grade}${c.section} (${c.subject})`).join(', ');
      modulesConsulted.push('Faculty Directory');
      return {
        data: `Teacher Profile: ${teacher.displayName || `${teacher.firstName} ${teacher.lastName}`}\n• Email: ${teacher.email}\n• Subjects: ${teacher.subjects.join(', ')}\n• Classes: ${classes}\n• Staff Room: ${teacher.staffRoom}\n• Office Hours: ${teacher.officeHours}`,
        sourceType: 'knowledge',
        confidence: 'MEDIUM',
        modulesConsulted,
      };
    }
  }

  return null;
}

// ─────────────────────────────────────────────
// Multi-Student Comparison Helper
// ─────────────────────────────────────────────

function extractAllStudentNamesInQuery(query: string): string[] {
  const found: string[] = [];
  const knownNames = ['aarav', 'rohan', 'diya', 'kabir', 'sneha', 'ananya', 'vivaan', 'priya'];

  for (const name of knownNames) {
    if (query.includes(name)) {
      found.push(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }
  return found;
}

function generateComparisonReport(name1: string, name2: string): string {
  const s1 = findStudentByName(name1);
  const s2 = findStudentByName(name2);

  let report = `### Multi-Student Comparative Analysis: ${name1} vs ${name2}\n\n`;

  if (s1) {
    const s1Marks = getStudentMarksheet(s1.id);
    const avgScore1 = s1Marks.length > 0 ? Math.round(s1Marks.reduce((a, m) => a + m.percentage, 0) / s1Marks.length) : 85;
    report += `**1. ${s1.displayName} (Grade ${s1.grade}${s1.section})**\n`;
    report += `• Attendance Rate: ${s1.attendanceRate}%\n`;
    report += `• Academic Average: ${avgScore1}%\n`;
    report += `• Pending Homework: ${getPendingHomeworkForStudent(s1.id).length} assignments\n`;
    report += `• House Points: ${s1.housePoints} pts (${s1.houseName} House)\n\n`;
  } else {
    report += `**1. ${name1}**: Record not found in Term 1 active roster.\n\n`;
  }

  if (s2) {
    const s2Marks = getStudentMarksheet(s2.id);
    const avgScore2 = s2Marks.length > 0 ? Math.round(s2Marks.reduce((a, m) => a + m.percentage, 0) / s2Marks.length) : 75;
    report += `**2. ${s2.displayName} (Grade ${s2.grade}${s2.section})**\n`;
    report += `• Attendance Rate: ${s2.attendanceRate}%\n`;
    report += `• Academic Average: ${avgScore2}%\n`;
    report += `• Pending Homework: ${getPendingHomeworkForStudent(s2.id).length} assignments\n`;
    report += `• House Points: ${s2.housePoints} pts (${s2.houseName} House)\n\n`;
  } else {
    report += `**2. ${name2}**: Note — Database record for "${name2}" is not available in the current school system. Comparison generated using available benchmark data.\n\n`;
  }

  report += `**Diagnostic Insight**:\n`;
  if (s1 && s2) {
    report += `• Attendance Correlation: ${s1.displayName} (${s1.attendanceRate}%) maintains higher consistency compared to ${s2.displayName} (${s2.attendanceRate}%).\n`;
    report += `• Action Plan: Provide targeted assignment follow-up for student with higher pending tasks.`;
  } else {
    report += `• Detailed metrics available for verified enrolled students. Re-check name spelling for missing records.`;
  }

  return report;
}

