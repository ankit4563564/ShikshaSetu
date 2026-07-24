'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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
  teacherId: string;
}

export default function SchoolPulsePDF({ students, teacherId }: SchoolPulsePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

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
    setSelectedStudents(new Set(students.map(s => s.studentId)));
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const generatePDF = async () => {
    if (selectedStudents.size === 0) return;

    setIsGenerating(true);

    try {
      const element = document.getElementById('school-pulse-content');
      if (!element) return;

      const opt = {
        margin: 0,
        filename: `SchoolPulse_Week_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: 'avoid-all' as const, before: '.page-break' },
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('[School Pulse] PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareWhatsApp = () => {
    if (selectedStudents.size === 0) return;

    const studentNames = students
      .filter(s => selectedStudents.has(s.studentId))
      .map(s => s.displayName)
      .join(', ');

    const message = `📚 School Pulse Weekly Report\n\nStudents: ${studentNames}\n\nGenerated on ${new Date().toLocaleDateString()}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const selectedStudentsData = students.filter(s => selectedStudents.has(s.studentId));

  return (
    <div className="bg-white border border-deep-teal/10 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <h3 className="font-display text-sm font-extrabold text-deep-teal">
            School Pulse Weekly PDF
          </h3>
        </div>
      </div>

      <p className="font-body text-xs text-deep-teal/50 leading-relaxed">
        Generate weekly PDF reports for parents with attendance, homework status, positive notes, and conversation prompts. Download or share via WhatsApp.
      </p>

      {/* Student Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40">
            Select Students ({selectedStudents.size}/{students.length})
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-[10px] font-bold text-deep-teal/60 hover:text-deep-teal underline"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-[10px] font-bold text-deep-teal/60 hover:text-deep-teal underline"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid gap-2 max-h-48 overflow-y-auto">
          {students.map((student) => (
            <button
              key={student.studentId}
              onClick={() => toggleStudent(student.studentId)}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedStudents.has(student.studentId)
                  ? 'bg-deep-teal/5 border-deep-teal/20'
                  : 'bg-paper border-deep-teal/10 hover:border-deep-teal/20'
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                selectedStudents.has(student.studentId)
                  ? 'bg-deep-teal border-deep-teal'
                  : 'border-deep-teal/30'
              }`}>
                {selectedStudents.has(student.studentId) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-display text-xs font-semibold text-deep-teal">
                {student.displayName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={generatePDF}
          disabled={selectedStudents.size === 0 || isGenerating}
          className="flex-1 bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {isGenerating ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </>
          )}
        </button>
        <button
          onClick={shareWhatsApp}
          disabled={selectedStudents.size === 0}
          className="flex-1 bg-[#25D366] hover:bg-[#128C7E] text-white font-display text-xs font-bold py-3 rounded-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Share WhatsApp
        </button>
      </div>

      {/* Hidden PDF Content */}
      <div id="school-pulse-content" className="hidden">
        {selectedStudentsData.map((student, index) => (
          <div key={student.studentId} className={`page-break ${index > 0 ? 'mt-8' : ''}`}>
            <div style={{ 
              fontFamily: 'Baloo 2, sans-serif',
              padding: '20mm',
              backgroundColor: '#fbf8f3',
              minHeight: '297mm',
              color: '#1f4e5f'
            }}>
              {/* Header */}
              <div style={{ 
                borderBottom: '2px solid #1f4e5f',
                paddingBottom: '10mm',
                marginBottom: '10mm'
              }}>
                <h1 style={{ 
                  fontSize: '24pt',
                  fontWeight: 'bold',
                  margin: '0',
                  color: '#1f4e5f'
                }}>
                  School Pulse Weekly Report
                </h1>
                <p style={{ 
                  fontSize: '12pt',
                  margin: '5mm 0 0 0',
                  color: '#1f4e5f80'
                }}>
                  Week of {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Student Info */}
              <div style={{ marginBottom: '8mm' }}>
                <h2 style={{ 
                  fontSize: '18pt',
                  fontWeight: 'bold',
                  margin: '0 0 5mm 0',
                  color: '#1f4e5f'
                }}>
                  {student.displayName}
                </h2>
              </div>

              {/* Attendance Section */}
              <div style={{ 
                backgroundColor: '#ffffff',
                border: '2px solid #1f4e5f10',
                borderRadius: '8mm',
                padding: '6mm',
                marginBottom: '6mm'
              }}>
                <h3 style={{ 
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  margin: '0 0 4mm 0',
                  color: '#1f4e5f'
                }}>
                  📊 Attendance
                </h3>
                <div style={{ display: 'flex', gap: '4mm', alignItems: 'center' }}>
                  <div style={{ 
                    fontSize: '32pt',
                    fontWeight: 'bold',
                    color: student.attendance.percentage >= 80 ? '#6b9080' : student.attendance.percentage >= 60 ? '#e8a33d' : '#c1502e'
                  }}>
                    {student.attendance.percentage}%
                  </div>
                  <div style={{ fontSize: '12pt', color: '#1f4e5f60' }}>
                    {student.attendance.present}/{student.attendance.total} days present
                  </div>
                </div>
              </div>

              {/* Homework Section */}
              <div style={{ 
                backgroundColor: '#ffffff',
                border: '2px solid #1f4e5f10',
                borderRadius: '8mm',
                padding: '6mm',
                marginBottom: '6mm'
              }}>
                <h3 style={{ 
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  margin: '0 0 4mm 0',
                  color: '#1f4e5f'
                }}>
                  📝 Homework
                </h3>
                <div style={{ display: 'flex', gap: '4mm', alignItems: 'center' }}>
                  <div style={{ 
                    fontSize: '32pt',
                    fontWeight: 'bold',
                    color: student.homework.percentage >= 80 ? '#6b9080' : student.homework.percentage >= 60 ? '#e8a33d' : '#c1502e'
                  }}>
                    {student.homework.percentage}%
                  </div>
                  <div style={{ fontSize: '12pt', color: '#1f4e5f60' }}>
                    {student.homework.submitted}/{student.homework.total} assignments submitted
                  </div>
                </div>
              </div>

              {/* Positive Note Section */}
              <div style={{ 
                backgroundColor: '#6b908010',
                border: '2px solid #6b908020',
                borderRadius: '8mm',
                padding: '6mm',
                marginBottom: '6mm'
              }}>
                <h3 style={{ 
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  margin: '0 0 4mm 0',
                  color: '#6b9080'
                }}>
                  💚 Positive Note
                </h3>
                <p style={{ 
                  fontSize: '12pt',
                  margin: '0',
                  lineHeight: '1.6',
                  color: '#1f4e5f'
                }}>
                  {student.positiveNote}
                </p>
              </div>

              {/* Conversation Prompt Section */}
              <div style={{ 
                backgroundColor: '#e8a33d10',
                border: '2px solid #e8a33d20',
                borderRadius: '8mm',
                padding: '6mm'
              }}>
                <h3 style={{ 
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  margin: '0 0 4mm 0',
                  color: '#e8a33d'
                }}>
                  💬 Conversation Starter
                </h3>
                <p style={{ 
                  fontSize: '12pt',
                  margin: '0',
                  lineHeight: '1.6',
                  color: '#1f4e5f'
                }}>
                  {student.conversationPrompt}
                </p>
              </div>

              {/* Footer */}
              <div style={{ 
                marginTop: '10mm',
                paddingTop: '5mm',
                borderTop: '1px solid #1f4e5f20',
                fontSize: '10pt',
                color: '#1f4e5f40',
                textAlign: 'center'
              }}>
                Generated by ShikshaSetu • School Pulse Weekly Report
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
