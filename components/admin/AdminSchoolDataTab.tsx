'use client';

import React, { useState, useEffect } from 'react';
import {
  getMasterStudentsAction,
  getMasterParentsAction,
  getMasterTeachersAction,
  getMasterClassesAction,
  saveMasterStudentAction,
  linkStudentToParentAction,
  type MasterStudent,
  type MasterParent,
  type MasterTeacher,
  type MasterClass,
} from '@/app/actions/adminDataActions';

export default function AdminSchoolDataTab() {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'parents' | 'teachers' | 'classes'>('students');
  const [students, setStudents] = useState<MasterStudent[]>([]);
  const [parents, setParents] = useState<MasterParent[]>([]);
  const [teachers, setTeachers] = useState<MasterTeacher[]>([]);
  const [classes, setClasses] = useState<MasterClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Add/Edit Student modal state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    grade: '8',
    section: 'A',
    rollNumber: '',
  });

  // Link Parent modal state
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);
  const [selectedStudentForLink, setSelectedStudentForLink] = useState<MasterStudent | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [relationship, setRelationship] = useState<string>('Mother');

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, pData, tData, cData] = await Promise.all([
        getMasterStudentsAction(),
        getMasterParentsAction(),
        getMasterTeachersAction(),
        getMasterClassesAction(),
      ]);
      setStudents(sData);
      setParents(pData);
      setTeachers(tData);
      setClasses(cData);
    } catch {
      setToast({ message: 'Error loading master records', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await saveMasterStudentAction({
      id: studentForm.id || undefined,
      first_name: studentForm.firstName,
      last_name: studentForm.lastName,
      display_name: `${studentForm.firstName} ${studentForm.lastName}`.trim(),
      grade: studentForm.grade,
      section: studentForm.section,
      roll_number: studentForm.rollNumber,
    });

    if (result.success) {
      setToast({ message: 'Student record saved to Canonical Registry!', type: 'success' });
      setIsAddStudentOpen(false);
      setStudentForm({ id: '', firstName: '', lastName: '', grade: '8', section: 'A', rollNumber: '' });
      loadData();
    } else {
      setToast({ message: result.error || 'Failed to save student', type: 'error' });
    }
  };

  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForLink || !selectedParentId) return;

    const result = await linkStudentToParentAction(selectedStudentForLink.id, selectedParentId, relationship);
    if (result.success) {
      setToast({ message: `Successfully linked ${selectedStudentForLink.display_name} to Guardian!`, type: 'success' });
      setIsLinkParentOpen(false);
      loadData();
    } else {
      setToast({ message: result.error || 'Failed to link relationship', type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'} {toast.message}</span>
          <button type="button" onClick={() => setToast(null)} className="text-xs font-bold opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏫</span>
            <h2 className="font-display text-xl font-bold text-slate-900">
              School Master Data & Canonical Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Authoritative master dataset. Record once — instantly accessible to Teacher, Student, Parent portals & AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Synced with School Record
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'students' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          👨‍🎓 Students ({students.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('parents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'parents' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          👨‍👩‍👧 Parents & Guardians ({parents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('teachers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'teachers' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          👩‍🏫 Teachers & Faculty ({teachers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('classes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'classes' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          🏛️ Classes & Sections ({classes.length})
        </button>
      </div>

      {/* ── Sub-Tab 1: Students ── */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Student Registry</h3>
              <p className="text-xs text-slate-500">All registered students, class assignments, and linked guardians</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStudentForm({ id: '', firstName: '', lastName: '', grade: '8', section: 'A', rollNumber: '' });
                setIsAddStudentOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>+</span>
              <span>Add Student</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">House</th>
                  <th className="py-3 px-4">Linked Parent / Guardian</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{student.display_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {student.id.slice(0, 8)}...</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">Class {student.grade}{student.section}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600">#{student.roll_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {student.house || 'Ruby'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {student.guardian_name ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-800 font-semibold">{student.guardian_name}</span>
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                            ({student.relationship || 'Guardian'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not Linked</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForLink(student);
                            setSelectedParentId(student.guardian_id || (parents[0]?.id || ''));
                            setRelationship(student.relationship || 'Mother');
                            setIsLinkParentOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                        >
                          🔗 Link Parent
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentForm({
                              id: student.id,
                              firstName: student.first_name,
                              lastName: student.last_name,
                              grade: student.grade,
                              section: student.section,
                              rollNumber: student.roll_number,
                            });
                            setIsAddStudentOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold cursor-pointer"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sub-Tab 2: Parents & Guardians ── */}
      {activeSubTab === 'parents' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Parent & Guardian Registry</h3>
              <p className="text-xs text-slate-500">Authorized guardians and their linked children</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parents.map((parent) => (
              <div key={parent.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{parent.display_name}</span>
                    <span className="text-xs text-slate-500 font-medium">{parent.relationship}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    Verified Guardian
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p>📞 {parent.phone || '+91 98765 43210'}</p>
                  <p>✉️ {parent.email || 'guardian@example.com'}</p>
                </div>

                <div className="border-t border-slate-200 pt-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Linked Children:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {parent.linked_students && parent.linked_students.length > 0 ? (
                      parent.linked_students.map((child) => (
                        <span key={child.id} className="px-2 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold text-xs">
                          👶 {child.name} (Class {child.grade}{child.section})
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No linked children</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-Tab 3: Teachers ── */}
      {activeSubTab === 'teachers' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Faculty & Class Assignments</h3>
              <p className="text-xs text-slate-500">Teachers and their allocated classrooms</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{teacher.display_name}</span>
                    <span className="text-xs text-indigo-600 font-semibold">Class Teacher: Class {teacher.grade}{teacher.section}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">
                    Active Faculty
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-0.5 pt-1">
                  <p>📖 Subject: {teacher.subject}</p>
                  <p>✉️ {teacher.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sub-Tab 4: Classes ── */}
      {activeSubTab === 'classes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900">Academic Classes & Sections</h3>
              <p className="text-xs text-slate-500">Classrooms and student roster allocations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
                <span className="font-display text-lg font-black text-slate-900 block">Class {cls.grade}{cls.section}</span>
                <span className="text-xs text-slate-500 font-medium block">Teacher: {cls.class_teacher_name}</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                  {cls.total_students} Students
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add / Edit Student Modal ── */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display text-base font-bold text-slate-900">
                {studentForm.id ? 'Edit Student Record' : 'Add New Student'}
              </h4>
              <button type="button" onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.firstName}
                    onChange={(e) => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. Aarav"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={studentForm.lastName}
                    onChange={(e) => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                    placeholder="e.g. Sharma"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Class Grade</label>
                  <select
                    value={studentForm.grade}
                    onChange={(e) => setStudentForm({ ...studentForm, grade: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  >
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Section</label>
                  <select
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({ ...studentForm, section: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                  >
                    <option value="A">Sec A</option>
                    <option value="B">Sec B</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={studentForm.rollNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                    placeholder="801"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Save Record
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Link Student to Parent Modal ── */}
      {isLinkParentOpen && selectedStudentForLink && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-display text-base font-bold text-slate-900">
                Link Parent / Guardian to Student
              </h4>
              <button type="button" onClick={() => setIsLinkParentOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-950 font-medium">
              Student: <strong>{selectedStudentForLink.display_name}</strong> (Class {selectedStudentForLink.grade}{selectedStudentForLink.section} &middot; Roll #{selectedStudentForLink.roll_number})
            </div>

            <form onSubmit={handleSaveLink} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Select Guardian</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                >
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.display_name} ({p.relationship}) &middot; {p.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Relationship</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-indigo-500"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  Save Relationship Link
                </button>
                <button
                  type="button"
                  onClick={() => setIsLinkParentOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
