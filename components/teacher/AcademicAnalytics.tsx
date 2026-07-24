'use client';

import { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { StatusResult } from '@/lib/rules-engine/calculateStatus';

interface AcademicAnalyticsProps {
  students: (StatusResult & {
    photoUrl: string | null;
    explanation: string;
    activeStatusFlag?: {
      id: string;
      status: string;
      isCorrected: boolean;
    } | null;
  })[];
  rawStudentsData: any[]; 
}

function getWeekIndex(dateStr: string): number {
  const date = new Date(dateStr);
  const start = new Date('2026-06-15');
  const diffTime = Math.abs(date.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const week = Math.floor((diffDays - 1) / 7);
  return Math.min(3, Math.max(0, week));
}

export default function AcademicAnalytics({ students, rawStudentsData }: AcademicAnalyticsProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.studentId || '');

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.studentId === selectedStudentId);
  }, [students, selectedStudentId]);

  const selectedRawData = useMemo(() => {
    return rawStudentsData.find((s) => s.studentId === selectedStudentId);
  }, [rawStudentsData, selectedStudentId]);

  // 1. Transform Growth-Over-Time Data (Last 4 Weeks)
  const growthData = useMemo(() => {
    if (!selectedRawData) return [];

    const weeks = [
      { name: 'Week 1', label: 'June 15-21', attendanceCount: 0, presentCount: 0, hwCount: 0, hwSubmitted: 0, gradePctSum: 0, gradeCount: 0 },
      { name: 'Week 2', label: 'June 22-28', attendanceCount: 0, presentCount: 0, hwCount: 0, hwSubmitted: 0, gradePctSum: 0, gradeCount: 0 },
      { name: 'Week 3', label: 'June 29-July 5', attendanceCount: 0, presentCount: 0, hwCount: 0, hwSubmitted: 0, gradePctSum: 0, gradeCount: 0 },
      { name: 'Week 4', label: 'July 6-12', attendanceCount: 0, presentCount: 0, hwCount: 0, hwSubmitted: 0, gradePctSum: 0, gradeCount: 0 },
    ];

    selectedRawData.attendance.forEach((att: any) => {
      const wIdx = getWeekIndex(att.date);
      weeks[wIdx].attendanceCount++;
      if (att.status === 'present' || att.status === 'late' || att.status === 'excused') {
        weeks[wIdx].presentCount++;
      }
    });

    selectedRawData.homework.forEach((hw: any) => {
      const wIdx = getWeekIndex(hw.dueDate);
      weeks[wIdx].hwCount++;
      if (hw.isSubmitted || hw.submittedAt) {
        weeks[wIdx].hwSubmitted++;
      }
    });

    selectedRawData.grades.forEach((gr: any) => {
      const wIdx = getWeekIndex(gr.assessmentDate);
      weeks[wIdx].gradeCount++;
      weeks[wIdx].gradePctSum += (gr.score / gr.maxScore) * 100;
    });

    let lastGradeAvg = 80;
    return weeks.map((w) => {
      const attendance = w.attendanceCount > 0 ? (w.presentCount / w.attendanceCount) * 100 : 100;
      const homework = w.hwCount > 0 ? (w.hwSubmitted / w.hwCount) * 100 : 100;
      
      let grade = lastGradeAvg;
      if (w.gradeCount > 0) {
        grade = w.gradePctSum / w.gradeCount;
        lastGradeAvg = grade;
      }

      return {
        name: w.name,
        range: w.label,
        Attendance: Math.round(attendance),
        Homework: Math.round(homework),
        Grades: Math.round(grade),
      };
    });
  }, [selectedRawData]);

  // 2. Transform Subject-Wise Breakdown Data (Math, Science, English, History, etc.)
  const subjectData = useMemo(() => {
    if (!selectedRawData) return [];

    const subjects = Array.from(new Set([
      ...selectedRawData.grades.map((g: any) => g.subject),
      ...selectedRawData.homework.map((h: any) => h.subject)
    ]));

    if (subjects.length === 0) {
      subjects.push('Math', 'Science');
    }

    return subjects.map((subject) => {
      const subGrades = selectedRawData.grades.filter((g: any) => g.subject === subject);
      const subHw = selectedRawData.homework.filter((h: any) => h.subject === subject);

      const gradeAvg = subGrades.length > 0
        ? subGrades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / subGrades.length
        : 0;

      const hwRate = subHw.length > 0
        ? (subHw.filter((h: any) => h.isSubmitted || h.submittedAt).length / subHw.length) * 100
        : 0;

      return {
        name: subject,
        Grades: Math.round(gradeAvg),
        Homework: Math.round(hwRate),
      };
    });
  }, [selectedRawData]);

  // 3. Transform Class-Wide Comparison Data (All Students - Alphabetical)
  const classComparisonData = useMemo(() => {
    const list = rawStudentsData.map((studentRaw) => {
      const studentDisplay = students.find(s => s.studentId === studentRaw.studentId);
      const name = studentDisplay?.displayName || 'Unknown';

      const totalAtt = studentRaw.attendance?.length || 0;
      const presentAtt = studentRaw.attendance?.filter((a: any) => a.status === 'present' || a.status === 'late' || a.status === 'excused').length || 0;
      const attendance = totalAtt > 0 ? (presentAtt / totalAtt) * 100 : 0;

      const totalHw = studentRaw.homework?.length || 0;
      const submittedHw = studentRaw.homework?.filter((h: any) => h.isSubmitted || h.submittedAt).length || 0;
      const homework = totalHw > 0 ? (submittedHw / totalHw) * 100 : 0;

      const totalGrades = studentRaw.grades?.length || 0;
      const gradeAvg = totalGrades > 0
        ? studentRaw.grades.reduce((sum: number, g: any) => sum + (g.score / g.maxScore) * 100, 0) / totalGrades
        : 0;

      return {
        name,
        Grades: Math.round(gradeAvg),
        Homework: Math.round(homework),
        Attendance: Math.round(attendance),
      };
    });

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [students, rawStudentsData]);

  // Font family config for Recharts tick labels (IBM Plex Mono)
  const rechartsLabelStyle = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 11,
    fill: 'var(--deep-teal)',
    opacity: 0.6,
  };

  const rechartsLegendStyle = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: 11,
  };

  const renderLegendText = (value: string) => {
    return (
      <span className="font-mono text-xs text-deep-teal/80 px-1">
        {value}
      </span>
    );
  };

  // Custom Tooltip component with IBM Plex Mono style wrapper
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="rounded-xl border border-deep-teal/10 bg-paper/95 p-3.5 shadow-md backdrop-blur-md"
          style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '11px' }}
        >
          <p className="font-semibold text-deep-teal mb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 justify-between">
                <span className="flex items-center gap-1.5" style={{ color: item.color || item.fill }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
                  {item.name}:
                </span>
                <span className="font-bold text-deep-teal">
                  {typeof item.value === 'number' ? item.value.toFixed(0) : item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Student Selector Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-deep-teal/10 bg-paper p-5 shadow-xs">
        <div>
          <h2 className="font-display text-lg font-bold text-deep-teal">
            Academic Performance Analysis
          </h2>
          <p className="mt-1 font-body text-xs text-deep-teal/60">
            Analyze individual student growth trends, subject-wise metrics, and class-wide performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-display text-sm font-semibold text-deep-teal">Select a student:</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="rounded-lg border border-deep-teal/15 bg-paper px-4 py-2 font-display text-sm font-semibold text-deep-teal outline-none focus:ring-2 focus:ring-deep-teal/20"
          >
            {students.map((student) => (
              <option key={student.studentId} value={student.studentId}>
                {student.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stacked Vertically Charts Container */}
      <div className="space-y-8">
        
        {/* Chart 1 — Growth Over Time (Line chart) */}
        <div className="rounded-lg border border-sage/20 bg-paper p-6 shadow-sm">
          <div className="mb-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-deep-teal/40 uppercase">
              Time Series
            </span>
            <h3 className="font-display text-base font-bold text-deep-teal">
              Growth Over Time — {selectedStudent?.displayName}
            </h3>
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div className="h-[280px] min-w-[600px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 78, 95, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    tick={rechartsLabelStyle}
                    stroke="rgba(31, 78, 95, 0.1)"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={rechartsLabelStyle}
                    stroke="rgba(31, 78, 95, 0.1)"
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    wrapperStyle={rechartsLegendStyle}
                    formatter={renderLegendText} 
                    iconType="circle"
                    verticalAlign="top"
                    height={36}
                  />
                  {/* Attendance line: --sage */}
                  <Line
                    type="monotone"
                    dataKey="Attendance"
                    name="Attendance Rate"
                    stroke="var(--sage)"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                    dot={{ strokeWidth: 2, r: 3 }}
                  />
                  {/* Homework line: --marigold */}
                  <Line
                    type="monotone"
                    dataKey="Homework"
                    name="Homework Completion"
                    stroke="var(--marigold)"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                    dot={{ strokeWidth: 2, r: 3 }}
                  />
                  {/* Grades line: --deep-teal */}
                  <Line
                    type="monotone"
                    dataKey="Grades"
                    name="Avg Grade"
                    stroke="var(--deep-teal)"
                    strokeWidth={2.5}
                    activeDot={{ r: 6 }}
                    dot={{ strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 2 — Subject Breakdown (Bar chart) */}
        <div className="rounded-lg border border-sage/20 bg-paper p-6 shadow-sm">
          <div className="mb-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-deep-teal/40 uppercase">
              Subject Comparison
            </span>
            <h3 className="font-display text-base font-bold text-deep-teal">
              Subject Breakdown — {selectedStudent?.displayName}
            </h3>
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div className="h-[260px] min-w-[500px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 78, 95, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    tick={rechartsLabelStyle}
                    stroke="rgba(31, 78, 95, 0.1)"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={rechartsLabelStyle}
                    stroke="rgba(31, 78, 95, 0.1)"
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    wrapperStyle={rechartsLegendStyle}
                    formatter={renderLegendText} 
                    iconType="circle"
                    verticalAlign="top"
                    height={36}
                  />
                  {/* Grade: --deep-teal */}
                  <Bar dataKey="Grades" name="Avg Grade" fill="var(--deep-teal)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  {/* Homework: --marigold */}
                  <Bar dataKey="Homework" name="Homework Rate" fill="var(--marigold)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3 — Class Comparison (Bar chart) */}
        <div className="rounded-lg border border-sage/20 bg-paper p-6 shadow-sm">
          <div className="mb-4">
            <span className="font-mono text-[10px] font-bold tracking-widest text-deep-teal/40 uppercase">
              Class Comparison
            </span>
            <h3 className="font-display text-base font-bold text-deep-teal">
              Class Comparison (Grade 8A)
            </h3>
          </div>
          <div className="w-full overflow-x-auto scrollbar-thin">
            <div className="h-[400px] min-w-[800px] md:min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classComparisonData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(31, 78, 95, 0.05)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ ...rechartsLabelStyle, angle: -45, textAnchor: 'end' }}
                    stroke="rgba(31, 78, 95, 0.1)"
                    height={70}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={rechartsLabelStyle}
                    stroke="rgba(31, 78, 95, 0.1)"
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend 
                    wrapperStyle={rechartsLegendStyle}
                    formatter={renderLegendText} 
                    iconType="circle"
                    verticalAlign="top"
                    height={36}
                  />
                  {/* Attendance: --sage */}
                  <Bar dataKey="Attendance" name="Attendance Rate" fill="var(--sage)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                  {/* Grade: --deep-teal */}
                  <Bar dataKey="Grades" name="Grades Avg" fill="var(--deep-teal)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                  {/* Homework: --marigold */}
                  <Bar dataKey="Homework" name="Homework Rate" fill="var(--marigold)" radius={[4, 4, 0, 0]} maxBarSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
