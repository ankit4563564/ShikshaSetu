'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainFeeStatusAction } from '@/app/actions/parentAiActions';

interface FeeItem {
  id: string;
  head: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'partially_paid';
  paidAmount: number;
  paidAt?: string;
  receiptNumber?: string;
}

interface ParentFeesTabProps {
  studentName: string;
  studentGrade?: string;
  isLoading?: boolean;
}

export function ParentFeesTab({
  studentName,
  studentGrade = '8A',
  isLoading = false,
}: ParentFeesTabProps) {
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [feeExplanation, setFeeExplanation] = useState<{
    summary: string;
    paidStatus: string;
    pendingStatus: string;
    guidance: string;
  } | null>(null);

  const feeSchedule: FeeItem[] = [
    {
      id: 'fee-001',
      head: 'Term 1 Tuition & Academic Fee',
      amount: 24000,
      paidAmount: 24000,
      dueDate: '2026-07-15',
      status: 'paid',
      paidAt: '2026-07-05',
      receiptNumber: 'SS-2026-8834',
    },
    {
      id: 'fee-002',
      head: 'School Transport / Bus Fee (Term 1)',
      amount: 6500,
      paidAmount: 6500,
      dueDate: '2026-07-15',
      status: 'paid',
      paidAt: '2026-07-05',
      receiptNumber: 'SS-2026-8835',
    },
    {
      id: 'fee-003',
      head: 'Term 2 Tuition & Science Lab Fee',
      amount: 24000,
      paidAmount: 0,
      dueDate: '2026-10-15',
      status: 'pending',
    },
    {
      id: 'fee-004',
      head: 'Annual Activity & Co-curricular Fee',
      amount: 3500,
      paidAmount: 3500,
      dueDate: '2026-06-30',
      status: 'paid',
      paidAt: '2026-06-25',
      receiptNumber: 'SS-2026-7721',
    },
  ];

  const totalAmount = feeSchedule.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = feeSchedule.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPending = feeSchedule.reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);

  useEffect(() => {
    async function loadFeeAi() {
      try {
        const res = await explainFeeStatusAction({
          totalAmount,
          paidAmount: totalPaid,
          pendingAmount: totalPending,
          nextDueDate: '2026-10-15',
          studentName: studentName.split(' ')[0],
        });
        if (res.success && res.explanation) {
          setFeeExplanation(res.explanation);
        }
      } catch (err) {
        console.warn('Failed to load fee explanation:', err);
      }
    }
    loadFeeAi();
  }, [totalAmount, totalPaid, totalPending, studentName]);

  const handleDownloadReceipt = (fee: FeeItem) => {
    setDownloadingReceipt(fee.id);
    setTimeout(() => {
      setDownloadingReceipt(null);
      const receiptContent = `SHIKSHASETU OFFICIAL FEE RECEIPT\n===================================\nReceipt No: ${fee.receiptNumber || 'SS-TEMP'}\nStudent Name: ${studentName} (Class ${studentGrade})\nFee Head: ${fee.head}\nAmount Paid: ₹${fee.paidAmount.toLocaleString('en-IN')}\nPayment Date: ${fee.paidAt || 'N/A'}\nPayment Mode: School Verified Bank Transfer\nStatus: PAID & CLEARED\n===================================`;
      const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${fee.receiptNumber || 'Fee'}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-deep-teal">
              Fee Schedule &amp; Receipts
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-deep-teal/10 text-deep-teal font-extrabold text-[10px] uppercase tracking-wider">
              Academic Year 2026-27
            </span>
          </div>
          <p className="font-body text-xs text-deep-teal/60 font-medium mt-0.5">
            Verified fee statement and receipt ledger for {studentName}.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-emerald-50/80 border border-emerald-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block font-mono">
            ✓ Total Paid
          </span>
          <p className="font-display text-2xl font-extrabold text-emerald-800">
            ₹{totalPaid.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-600 font-medium">Recorded across all terms</p>
        </div>

        <div className="rounded-3xl bg-amber-50/80 border border-amber-200 p-4 shadow-2xs space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block font-mono">
            ⏳ Next Due Amount
          </span>
          <p className="font-display text-2xl font-extrabold text-amber-800">
            ₹{totalPending.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-amber-600 font-medium">Due by 15 Oct 2026</p>
        </div>
      </div>

      {/* ── AI Fee Explanation Card ── */}
      {feeExplanation && (
        <div className="rounded-3xl bg-white border border-teal-600/20 p-5 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-deep-teal/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-deep-teal">
                Fee Status Summary
              </h4>
            </div>
            <span className="text-[10px] font-mono text-deep-teal/40 font-bold uppercase">
              Authoritative School Ledger
            </span>
          </div>

          <p className="text-xs text-deep-teal/80 font-medium leading-relaxed">
            {feeExplanation.summary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-2xl bg-paper border border-deep-teal/5 text-deep-teal/70 font-medium">
              💳 {feeExplanation.paidStatus}
            </div>
            <div className="p-2.5 rounded-2xl bg-paper border border-deep-teal/5 text-deep-teal/70 font-medium">
              🗓️ {feeExplanation.pendingStatus}
            </div>
          </div>
        </div>
      )}

      {/* Fee Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-deep-teal">
            Installment Breakdown
          </h4>
          {totalPending > 0 && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-deep-teal text-white text-xs font-bold hover:bg-deep-teal/90 transition-all shadow-xs"
            >
              <span>💳</span>
              <span>Pay Balance (₹{totalPending.toLocaleString('en-IN')})</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          {feeSchedule.map((item) => {
            const isPaid = item.status === 'paid';
            const isDownloading = downloadingReceipt === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-deep-teal/10 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPaid ? '✓ Paid' : '⏳ Pending'}
                    </span>
                    <span className="text-[11px] text-deep-teal/50 font-medium">
                      Due: {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-bold text-deep-teal">
                    {item.head}
                  </h4>
                  <p className="font-display text-base font-extrabold text-deep-teal">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="shrink-0">
                  {isPaid ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadReceipt(item)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-deep-teal/5 hover:bg-deep-teal hover:text-white text-deep-teal font-display text-xs font-bold transition-all active:scale-95 border border-deep-teal/15 disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <span>🧾</span>
                      )}
                      <span>Receipt #{item.receiptNumber?.split('-').pop()}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Pay Now →
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Honest Payment Instruction Card */}
      <div className="rounded-3xl bg-paper border border-deep-teal/10 p-5 text-xs space-y-2">
        <h5 className="font-display text-xs font-bold text-deep-teal flex items-center gap-1.5">
          <span>🏦</span> School Bank Transfer &amp; Fee Desk Details
        </h5>
        <div className="text-deep-teal/70 space-y-1 font-mono text-[11px]">
          <p>Bank: State Bank of India · A/C: 384920194820 · IFSC: SBIN0004829</p>
          <p>Account Name: ShikshaSetu Model School Administrative Fund</p>
          <p>Fee Counter Timings: Monday – Saturday, 08:30 AM – 02:00 PM</p>
        </div>
      </div>

      {/* Payment Options Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-deep-teal/10 pb-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-deep-teal">
                    Fee Payment Options
                  </h3>
                  <p className="font-body text-[11px] text-deep-teal/50">
                    Amount Pending: ₹{totalPending.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-1 rounded-full hover:bg-deep-teal/5 text-deep-teal/40"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-paper border border-deep-teal/10 space-y-1.5">
                  <span className="font-bold text-deep-teal uppercase text-[10px] tracking-wider block">
                    Option 1: Direct Bank Transfer (NEFT / IMPS)
                  </span>
                  <div className="font-mono text-[11px] text-deep-teal/80 space-y-0.5">
                    <p>A/C: 384920194820</p>
                    <p>IFSC: SBIN0004829</p>
                    <p>Ref: Student ID {studentName.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-paper border border-deep-teal/10 space-y-1.5">
                  <span className="font-bold text-deep-teal uppercase text-[10px] tracking-wider block">
                    Option 2: School Fee Counter
                  </span>
                  <p className="text-deep-teal/70 font-medium">
                    Cash, Cheque, or POS Card Swipe accepted at the main campus fee counter during school hours.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full py-2.5 rounded-xl bg-deep-teal text-white text-xs font-bold hover:bg-deep-teal/90 shadow-md"
              >
                Close Payment Details
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
