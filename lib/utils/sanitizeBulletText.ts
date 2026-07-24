/**
 * Sanitizes evidence bullets by converting raw numbers, percentages, and scores
 * to friendly plain-language descriptions.
 */
export function sanitizeBulletText(bullet: string): string {
  const lower = bullet.toLowerCase();

  // Perfect Attendance / No Absences
  if (lower.includes('perfect attendance') || lower.includes('100% present')) {
    return 'Excellent attendance';
  }

  // Attendance absences / rates
  if (lower.includes('days absent') || lower.includes('absence rate')) {
    return 'Frequent absences noted';
  }
  if (lower.includes('streak of absences') || lower.includes('consecutive absences') || lower.includes('days in a row absent')) {
    return 'Consecutive days absent without notice';
  }
  if (lower.includes('no attendance records')) {
    return 'No attendance records found';
  }

  // Homework Gap
  if (lower.includes('assignments missed') || lower.includes('homework gap') || lower.includes('assignments submitted')) {
    if (lower.includes('0 of') || lower.includes('0/')) {
      return 'All assignments submitted on time';
    }
    return 'Low submission this week';
  }
  if (lower.includes('streak of missed homework') || lower.includes('missed homework')) {
    return 'Consecutive missed homework assignments';
  }
  if (lower.includes('all assignments submitted on time')) {
    return 'All assignments submitted on time';
  }
  if (lower.includes('no homework records')) {
    return 'No homework records found';
  }

  // Grades
  if (lower.includes('average grade drop') || lower.includes('grade drop') || lower.includes('grade dipped') || lower.includes('scores have dipped')) {
    return 'Grade has slipped';
  }
  if (lower.includes('below') && lower.includes('passing')) {
    return 'Scores are below the passing mark';
  }
  if (lower.includes('no grades records')) {
    return 'No grades records found';
  }

  // Mood / Wellness
  if (lower.includes('average mood') || lower.includes('mood check-ins')) {
    // If it's a positive average mood (e.g. 4.0 or 5.0 out of 5)
    if (lower.includes('4.') || lower.includes('5.')) {
      return 'Mood has been positive';
    }
    return 'Mood has been lower';
  }
  if (lower.includes('streak of low mood') || lower.includes('low mood')) {
    return 'Consecutive low mood check-ins';
  }
  if (lower.includes('no mood records')) {
    return 'No mood records found';
  }

  // General fallback: remove percentages, digits, ratios, and decimals
  let clean = bullet;
  clean = clean.replace(/\d+%\s*(absence rate|gap)?/gi, '');
  clean = clean.replace(/\d+\/\d+/g, '');
  clean = clean.replace(/\d+\s+of\s+\d+/gi, '');
  clean = clean.replace(/\b\d+(\.\d+)?\b/g, '');
  
  // Clean up punctuation and spacing
  clean = clean.replace(/\s+/g, ' ').trim();
  clean = clean.replace(/\(\s*\)/g, '');
  
  return clean || 'Academic progress check-in';
}
