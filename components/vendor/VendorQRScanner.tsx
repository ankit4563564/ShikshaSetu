'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { scanRedemptionTokenAction } from '@/app/actions/vendorActions';

interface VendorQRScannerProps {
  vendorId: string;
  onScanComplete: () => void;
}

export default function VendorQRScanner({ vendorId, onScanComplete }: VendorQRScannerProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string; rewardName?: string } | null>(null);

  async function handleScan() {
    const token = tokenInput.trim();
    if (!token) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await scanRedemptionTokenAction(token, vendorId);
      if (res.success) {
        setResult({ success: true, message: 'Redemption verified!', studentName: res.studentName, rewardName: res.rewardName });
        setTokenInput('');
        onScanComplete();
      } else {
        setResult({ success: false, message: res.error || 'Scan failed' });
      }
    } catch {
      setResult({ success: false, message: 'Error processing scan' });
    } finally {
      setScanning(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleScan();
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-deep-teal/5 bg-white/70 p-5 backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-wider text-deep-teal/40 mb-2">Scan QR Token</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter or scan redemption token…"
            disabled={scanning}
            className="flex-1 rounded-xl border border-deep-teal/10 bg-white px-4 py-3 text-sm text-deep-teal placeholder-deep-teal/30 outline-none focus:border-deep-teal/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleScan}
            disabled={scanning || !tokenInput.trim()}
            className="rounded-xl bg-deep-teal px-5 py-3 text-sm font-bold text-white transition-all hover:bg-deep-teal/90 active:scale-95 disabled:opacity-40 shadow-md"
          >
            {scanning ? '…' : 'Verify'}
          </button>
        </div>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-5 ${
            result.success ? 'border-sage/20 bg-sage/5' : 'border-warm-clay/20 bg-warm-clay/5'
          }`}
        >
          <p className={`text-sm font-bold ${result.success ? 'text-sage' : 'text-warm-clay'}`}>
            {result.success ? '✓ Verified' : '✗ Failed'}
          </p>
          <p className="text-sm text-deep-teal/70 mt-1">{result.message}</p>
          {result.success && (
            <div className="mt-3 space-y-1 text-sm text-deep-teal/80">
              {result.studentName && <p><span className="font-bold">Student:</span> {result.studentName}</p>}
              {result.rewardName && <p><span className="font-bold">Reward:</span> {result.rewardName}</p>}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
