'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-2xl font-bold">
          ⚠️
        </div>
        <h1 className="font-display text-2xl font-extrabold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          An error occurred while loading this page. We have logged the issue and are investigating.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left rounded-xl bg-slate-100 p-3 text-xs text-slate-700 max-h-40 overflow-auto">
            <summary className="cursor-pointer font-bold text-slate-800">Dev Error Details</summary>
            <p className="mt-2 font-mono text-[11px] leading-tight break-all">{error.message}</p>
          </details>
        )}

        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-extrabold text-white transition-all hover:bg-slate-800 active:scale-95 shadow-xs"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
          >
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}
