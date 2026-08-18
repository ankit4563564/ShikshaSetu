'use client';

import { useState, useEffect } from 'react';

interface StudentData {
  studentId: string;
  displayName: string;
  attendance: {
    present: number;
    total: number;
    percentage: number;
  };
  homework: {
    submitted: number;
    total: number;
    percentage: number;
  };
  positiveNote: string;
  conversationPrompt: string;
}

interface SchoolPulsePDFProps {
  students: StudentData[];
  teacherId?: string;
}

export default function SchoolPulsePDF({ students, teacherId }: SchoolPulsePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  // Default: Pre-select all students for instant 1-click printing
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    () => new Set(students.map((s) => s.studentId))
  );

  // Update selection if students prop changes
  useEffect(() => {
    if (students.length > 0) {
      setSelectedStudents(new Set(students.map((s) => s.studentId)));
    }
  }, [students]);

  const toggleStudent = (studentId: string) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const selectAll = () => {
    setSelectedStudents(new Set(students.map((s) => s.studentId)));
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const generatePDF = async () => {
    if (selectedStudents.size === 0) return;

    setIsGenerating(true);

    try {
      const element = document.getElementById('school-pulse-content');
      if (!element) {
        window.print();
        setIsGenerating(false);
        return;
      }

      const opt = {
        margin: [5, 5, 5, 5],
        filename: `SchoolPulse_Report_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('[School Pulse] PDF generation fallback to native print:', error);
      window.print();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const shareWhatsApp = () => {
    if (selectedStudents.size === 0) return;

    const studentNames = students
      .filter((s) => selectedStudents.has(s.studentId))
      .map((s) => s.displayName)
      .join(', ');

    const message = `📚 *ShikshaSetu School Pulse Weekly Report*\n\nStudents: ${studentNames}\nDate: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\nAll student progress cards are ready for review.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const selectedStudentsData = students.filter((s) => selectedStudents.has(s.studentId));

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 font-sans">
      <div className="flex items-center justify-between border-b pb-3 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl font-bold">
            📄
          </div>
          <div>
            <h3 className="font-display text-base font-extrabold text-slate-900">
              School Pulse Student Report Cards
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Weekly attendance, homework status, teacher observations & conversation starters
            </p>
          </div>
        </div>
      </div>

      {/* Student Selection List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            Select Students ({selectedStudents.size}/{students.length})
          </span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
          {students.map((student) => (
            <button
              key={student.studentId}
              type="button"
              onClick={() => toggleStudent(student.studentId)}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                selectedStudents.has(student.studentId)
                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 shadow-2xs'
                  : 'bg-slate-50 border-slate-200/80 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedStudents.has(student.studentId)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-slate-300 bg-white'
                }`}
              >
                {selectedStudents.has(student.studentId) && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-display text-xs font-extrabold truncate block">
                  {student.displayName}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Att: {student.attendance.percentage}% • HW: {student.homework.percentage}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={generatePDF}
          disabled={selectedStudents.size === 0 || isGenerating}
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md cursor-pointer"
        >
          {isGenerating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <span>📥</span>
              <span>Download PDF ({selectedStudents.size} Cards)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBrowserPrint}
          disabled={selectedStudents.size === 0}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-display text-xs font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
        >
          <span>🖨️</span>
          <span>Print</span>
        </button>

        <button
          type="button"
          onClick={shareWhatsApp}
          disabled={selectedStudents.size === 0}
          className="bg-[#25D366] hover:bg-[#128C7E] text-white font-display text-xs font-extrabold py-3.5 px-4 rounded-2xl transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <span>💬</span>
          <span>Share</span>
        </button>
      </div>

      {/* Off-Screen PDF Render Node (Accessible to html2canvas without display:none) */}
      <div
        id="school-pulse-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '794px', // Standard A4 pixel width at 96 DPI
          backgroundColor: '#fbf8f3',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#1f4e5f',
          padding: '24px',
        }}
      >
        {selectedStudentsData.map((student, index) => (
          <div
            key={student.studentId}
            style={{
              pageBreakAfter: 'always',
              marginBottom: index < selectedStudentsData.length - 1 ? '40px' : '0',
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #1f4e5f15',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          >
            {/* Report Card Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '2px solid #1f4e5f20',
                paddingBottom: '16px',
                marginBottom: '24px',
              }}
            >
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', margin: '0', color: '#1f4e5f' }}>
                  ShikshaSetu • School Pulse Report
                </h1>
                <p style={{ fontSize: '12px', margin: '4px 0 0 0', color: '#1f4e5f80', fontWeight: '600' }}>
                  Academic Progress & Wellness Assessment
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#1f4e5f80' }}>
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1f4e5f' }}>
                  Grade 8A
                </span>
              </div>
            </div>

            {/* Student Profile Row */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#1f4e5f' }}>
                {student.displayName}
              </h2>
              <p style={{ fontSize: '12px', color: '#1f4e5f70', margin: '0', fontWeight: '600' }}>
                Class 8A • Roll #{student.studentId.substring(0, 4)} • Class Teacher: Ananya Mehra
              </p>
            </div>

            {/* Metrics Dual Column */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Attendance Card */}
              <div
                style={{
                  backgroundColor: '#fbf8f3',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #1f4e5f15',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1f4e5f80', textTransform: 'uppercase' }}>
                  📊 Attendance Consistency
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color: student.attendance.percentage >= 85 ? '#2e7d32' : student.attendance.percentage >= 70 ? '#f57c00' : '#c62828',
                    }}
                  >
                    {student.attendance.percentage}%
                  </span>
                  <span style={{ fontSize: '11px', color: '#1f4e5f70', fontWeight: '600' }}>
                    ({student.attendance.present}/{student.attendance.total} days on-track)
                  </span>
                </div>
              </div>

              {/* Homework Card */}
              <div
                style={{
                  backgroundColor: '#fbf8f3',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid #1f4e5f15',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1f4e5f80', textTransform: 'uppercase' }}>
                  📝 Homework & Tasks
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                  <span
                    style={{
                      fontSize: '28px',
                      fontWeight: '900',
                      color: student.homework.percentage >= 85 ? '#2e7d32' : student.homework.percentage >= 70 ? '#f57c00' : '#c62828',
                    }}
                  >
                    {student.homework.percentage}%
                  </span>
                  <span style={{ fontSize: '11px', color: '#1f4e5f70', fontWeight: '600' }}>
                    ({student.homework.submitted}/{student.homework.total} completed)
                  </span>
                </div>
              </div>
            </div>

            {/* Teacher Positive Note */}
            <div
              style={{
                backgroundColor: '#e8f5e9',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #c8e6c9',
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px 0', color: '#2e7d32' }}>
                💚 Teacher Observations & Strengths
              </h3>
              <p style={{ fontSize: '12px', margin: '0', lineHeight: '1.5', color: '#1b5e20', fontWeight: '500' }}>
                {student.positiveNote}
              </p>
            </div>

            {/* Conversation Starter */}
            <div
              style={{
                backgroundColor: '#fff8e1',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #ffecb3',
              }}
            >
              <h3 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px 0', color: '#f57f17' }}>
                💬 Parent-Child Conversation Starter
              </h3>
              <p style={{ fontSize: '12px', margin: '0', lineHeight: '1.5', color: '#5d4037', fontWeight: '500' }}>
                {student.conversationPrompt}
              </p>
            </div>

            {/* Footer Signoff */}
            <div
              style={{
                borderTop: '1px solid #1f4e5f15',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '10px',
                color: '#1f4e5f60',
                fontWeight: '600',
              }}
            >
              <span>Verified by ShikshaSetu Academic Framework</span>
              <span>Parent Signature: _______________________</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
