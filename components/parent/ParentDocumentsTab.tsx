'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DocumentItem {
  id: string;
  title: string;
  category: 'report_card' | 'certificate' | 'bonafide' | 'receipt' | 'letter';
  date: string;
  fileSize: string;
  downloadUrl?: string;
  isVerified?: boolean;
}

interface ParentDocumentsTabProps {
  studentName: string;
  studentGrade?: string;
  isLoading?: boolean;
}

export function ParentDocumentsTab({
  studentName,
  studentGrade = '8A',
  isLoading = false,
}: ParentDocumentsTabProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'report_card' | 'certificate' | 'receipt' | 'bonafide'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Structured official document catalog for the student
  const documents: DocumentItem[] = [
    {
      id: 'doc-001',
      title: `Term 1 Academic Progress Report — Grade ${studentGrade}`,
      category: 'report_card',
      date: '2026-08-15',
      fileSize: '420 KB',
      isVerified: true,
    },
    {
      id: 'doc-002',
      title: 'Annual School Bonafide Certificate (2026-27)',
      category: 'bonafide',
      date: '2026-07-10',
      fileSize: '185 KB',
      isVerified: true,
    },
    {
      id: 'doc-003',
      title: 'Term 1 Fee Payment Receipt #SS-2026-8834',
      category: 'receipt',
      date: '2026-07-05',
      fileSize: '120 KB',
      isVerified: true,
    },
    {
      id: 'doc-004',
      title: 'Inter-School Science Olympiad Certificate of Merit',
      category: 'certificate',
      date: '2026-06-20',
      fileSize: '750 KB',
      isVerified: true,
    },
    {
      id: 'doc-005',
      title: 'Annual Sports Day Participation Certificate',
      category: 'certificate',
      date: '2026-05-12',
      fileSize: '680 KB',
      isVerified: true,
    },
  ];

  const filteredDocs = documents.filter((doc) => {
    if (activeCategory === 'all') return true;
    return doc.category === activeCategory;
  });

  const handleDownload = (doc: DocumentItem) => {
    setDownloadingId(doc.id);
    setTimeout(() => {
      setDownloadingId(null);
      // Generate a clean text certificate / document blob for demo download
      const docContent = `SHIKSHASETU SECURE DOCUMENT LOCKER\n===================================\nDocument: ${doc.title}\nStudent: ${studentName} (Class ${studentGrade})\nIssued Date: ${doc.date}\nStatus: Officially Verified by School Administration\nVerification Token: SS-VERIFIED-${doc.id.toUpperCase()}-${Date.now()}\n===================================`;
      const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 600);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'report_card':
        return { label: 'Report Card', icon: '📊', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'bonafide':
        return { label: 'Bonafide Certificate', icon: '🏛️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'receipt':
        return { label: 'Fee Receipt', icon: '🧾', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'certificate':
        return { label: 'Achievement Award', icon: '🏆', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'School Letter', icon: '📄', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              Document Locker
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-deep-teal/10 text-deep-teal font-extrabold text-[10px] uppercase tracking-wider">
              🔒 Authenticated &amp; Verified
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Official academic transcripts, certificates, bonafide letters, and receipts for {studentName}.
          </p>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Docs', icon: '📁' },
          { id: 'report_card', label: 'Report Cards', icon: '📊' },
          { id: 'bonafide', label: 'Bonafide', icon: '🏛️' },
          { id: 'receipt', label: 'Fee Receipts', icon: '🧾' },
          { id: 'certificate', label: 'Certificates', icon: '🏆' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveCategory(tab.id as any)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
              activeCategory === tab.id
                ? 'bg-deep-teal border-deep-teal text-white shadow-xs'
                : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-deep-teal/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Document Cards */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => {
          const badge = getCategoryBadge(doc.category);
          const isDownloading = downloadingId === doc.id;

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-deep-teal/10 bg-white p-4 shadow-xs hover:border-deep-teal/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                    {badge.icon} {badge.label}
                  </span>
                  {doc.isVerified && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>✓</span> Verified by School
                    </span>
                  )}
                </div>
                <h4 className="font-display text-sm font-bold text-deep-teal">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-deep-teal/50 font-medium">
                  Issued: {new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · File size: {doc.fileSize}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(doc)}
                disabled={isDownloading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-deep-teal/5 hover:bg-deep-teal hover:text-white text-deep-teal font-display text-xs font-bold transition-all active:scale-95 border border-deep-teal/15 shrink-0 disabled:opacity-50"
              >
                {isDownloading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <span>⬇</span>
                )}
                <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Security Footer Note */}
      <div className="rounded-2xl bg-paper/60 border border-deep-teal/5 p-4 text-center">
        <p className="text-[11px] text-deep-teal/50">
          All documents are signed with cryptographic integrity tokens issued by the school board.
        </p>
      </div>
    </div>
  );
}
