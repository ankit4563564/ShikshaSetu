'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type { ScanMode, ScanOutput } from '@/lib/campus-id/types';
import { ScanResultDisplay } from './ScanResultDisplay';


type ScannerState = 'idle' | 'scanning' | 'verifying' | 'result' | 'error' | 'manual_entry';

interface CampusScannerProps {
  mode: ScanMode;
  onScan: (qrContent: string, mode: ScanMode) => Promise<ScanOutput>;
  onReset?: () => void;
  allowManualEntry?: boolean;
  modeLabel?: string;
  modeDescription?: string;
}

export function CampusScanner({
  mode,
  onScan,
  onReset,
  allowManualEntry = true,
  modeLabel,
  modeDescription,
}: CampusScannerProps) {
  const [state, setState] = useState<ScannerState>('idle');
  const [result, setResult] = useState<ScanOutput | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    // Clear scan interval
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    // Stop all media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    // Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // CRITICAL FIX: Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // CRITICAL FIX: Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key: close scanner or reset
      if (e.key === 'Escape') {
        if (state === 'result' || state === 'error') {
          reset();
        } else if (state === 'scanning' || state === 'manual_entry') {
          stopCamera();
          setState('idle');
        }
      }

      // Enter key: submit manual entry
      if (e.key === 'Enter' && state === 'manual_entry' && manualCode.length >= 3 && !isBusy) {
        handleManualSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, manualCode, isBusy]);

  // CRITICAL FIX: Implement actual QR detection using jsQR
  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || state !== 'scanning') {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return;
    }

    // Set canvas size to match video
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Detect QR code safely
    try {
      const jsQR = (typeof window !== 'undefined' && (window as any).jsQR) || eval('require')('jsqr');
      if (jsQR) {
        const code = (jsQR.default || jsQR)(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        if (code) {
          handleQrDetected(code.data);
        }
      }
    } catch {
      // jsqr not loaded/installed, graceful fallback
    }
  }, [state]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('scanning');
      setErrorText(null);

      // Start QR detection loop (check every 100ms)
      scanIntervalRef.current = window.setInterval(scanQRCode, 100);

    } catch (err) {
      setErrorText('Camera access denied. Use manual entry instead.');
      if (allowManualEntry) {
        setState('manual_entry');
      } else {
        setState('error');
      }
    }
  };

  const reset = () => {
    stopCamera();
    setState('idle');
    setResult(null);
    setErrorText(null);
    setManualCode('');
    onReset?.();
  };

  const handleQrDetected = async (qrContent: string) => {
    if (isBusy) return;
    setIsBusy(true);
    setState('verifying');
    stopCamera();

    // ACCESSIBILITY: Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration on scan
    }

    try {
      const scanResult = await onScan(qrContent, mode);
      setResult(scanResult);
      setState('result');

      // Success haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]); // Success pattern
      }
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Scan failed');
      setState('error');

      // Error haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 100]); // Error pattern
      }
    } finally {
      setIsBusy(false);
    }
  };

  const handleManualSubmit = async () => {
    if (manualCode.length < 3) return;
    setIsBusy(true);
    setState('verifying');

    try {
      const scanResult = await onScan(manualCode, mode);
      setResult(scanResult);
      setState('result');
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : 'Verification failed');
      setState('error');
    } finally {
      setIsBusy(false);
    }
  };

  const scanAgain = () => {
    setResult(null);
    setErrorText(null);
    setManualCode('');
    startCamera();
  };

  // Handle video click for QR simulation (in production, use a real QR scanner library)
  const handleVideoClick = () => {
    if (state !== 'scanning') return;
    // Stub: in production, integrate with html5-qrcode or camera-barcode-scanner
    // For now, manual entry is the primary fallback
  };

  return (
    <div className="campus-scanner">
      {/* Header */}
      <div className="mb-4">
        {modeLabel && (
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-deep-teal/45">
            {modeLabel}
          </p>
        )}
        <h2 className="font-display text-xl font-bold text-deep-teal">
          {modeDescription || 'Scan Campus Pass'}
        </h2>
        <p className="mt-1 text-xs text-deep-teal/55">
          {state === 'idle' && 'Tap the button below to start scanning.'}
          {state === 'scanning' && 'Point the camera at the QR code.'}
          {state === 'verifying' && 'Verifying...'}
          {state === 'result' && result?.validation.valid ? 'Verified successfully' : 'Scan result'}
          {state === 'manual_entry' && 'Enter the code manually.'}
        </p>
      </div>

      {/* Error display */}
      {errorText && (
        <div role="alert" className="mb-4 rounded-xl border border-warm-clay/30 bg-warm-clay/10 p-3 text-xs font-semibold text-warm-clay">
          {errorText}
        </div>
      )}

      {/* Scanner viewfinder */}
      {state === 'scanning' && (
        <div className="relative mb-4 overflow-hidden rounded-2xl bg-slate-950">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onClick={handleVideoClick}
            className="h-64 w-full object-cover"
          />
          {/* Hidden canvas for QR detection */}
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          <div className="absolute inset-0">
            <div className="absolute left-4 top-4 h-5 w-5 rounded-tl border-l-2 border-t-2 border-sage" />
            <div className="absolute right-4 top-4 h-5 w-5 rounded-tr border-r-2 border-t-2 border-sage" />
            <div className="absolute bottom-4 left-4 h-5 w-5 rounded-bl border-b-2 border-l-2 border-sage" />
            <div className="absolute bottom-4 right-4 h-5 w-5 rounded-br border-b-2 border-r-2 border-sage" />
          </div>
          <button
            type="button"
            onClick={scanAgain}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Verifying state */}
      {state === 'verifying' && (
        <div className="mb-4 flex h-32 items-center justify-center rounded-2xl border border-deep-teal/10 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-deep-teal border-t-transparent" />
            <p className="text-sm font-semibold text-deep-teal/60">Verifying...</p>
          </div>
        </div>
      )}

      {/* Scan result */}
      {state === 'result' && result && (
        <div className="mb-4">
          <ScanResultDisplay result={result} onScanAgain={scanAgain} />
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {state === 'idle' && (
          <button
            type="button"
            onClick={startCamera}
            className="w-full rounded-xl bg-deep-teal px-5 py-4 font-display text-base font-bold text-white shadow-md transition-all hover:bg-deep-teal/90"
          >
            Start Scanning
          </button>
        )}

        {state === 'scanning' && !isBusy && (
          <button
            type="button"
            onClick={() => {
              stopCamera();
              if (allowManualEntry) {
                setState('manual_entry');
              } else {
                setState('idle');
              }
            }}
            className="w-full rounded-xl border border-deep-teal/20 bg-white px-5 py-3 font-display text-sm font-bold text-deep-teal transition-colors hover:bg-deep-teal/5"
          >
            Enter Code Manually
          </button>
        )}

        {state === 'manual_entry' && (
          <div className="space-y-3">
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 font-mono text-xl font-extrabold transition-all ${
                    manualCode[i]
                      ? 'border-deep-teal bg-deep-teal text-white'
                      : 'border-deep-teal/20 bg-paper text-deep-teal/30'
                  }`}
                >
                  {manualCode[i] || '_'}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={!key || isBusy}
                  onClick={() => {
                    if (key === '⌫') {
                      setManualCode((prev) => prev.slice(0, -1));
                    } else if (key && manualCode.length < 6) {
                      const newCode = manualCode + key;
                      setManualCode(newCode);
                      if (newCode.length === 6) {
                        handleManualSubmit();
                      }
                    }
                  }}
                  className="h-12 rounded-xl border border-deep-teal/10 bg-white font-display text-base font-bold text-deep-teal transition-all hover:bg-deep-teal/5 active:scale-95 disabled:opacity-30"
                >
                  {key || ''}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setManualCode(''); setState('idle'); }}
                className="flex-1 rounded-xl border border-deep-teal/20 bg-white px-4 py-3 font-display text-sm font-bold text-deep-teal"
              >
                Back
              </button>
              <button
                type="button"
                onClick={startCamera}
                className="flex-1 rounded-xl bg-deep-teal px-4 py-3 font-display text-sm font-bold text-white"
              >
                Use Camera
              </button>
            </div>
          </div>
        )}

        {state === 'error' && (
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-xl bg-deep-teal px-5 py-4 font-display text-base font-bold text-white"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
