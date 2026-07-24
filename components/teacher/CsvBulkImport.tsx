'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Papa from 'papaparse';

interface CsvRow {
  [key: string]: string;
}

interface ColumnMapping {
  studentName: string;
  date?: string;
  presentAbsent?: string;
  subject?: string;
  score?: string;
}

interface CsvBulkImportProps {
  teacherId: string;
  onImportComplete?: () => void;
}

export default function CsvBulkImport({ teacherId, onImportComplete }: CsvBulkImportProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'processing' | 'complete'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ studentName: '' });
  const [importType, setImportType] = useState<'attendance' | 'grades'>('attendance');
  const [error, setError] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Parse CSV
    Papa.parse<CsvRow>(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<CsvRow>) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          return;
        }
        setParsedData(results.data);
        setHeaders(results.meta.fields || []);
        setStep('mapping');
      },
      error: (error: Error) => {
        setError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  const handleMappingSubmit = () => {
    if (!mapping.studentName) {
      setError('Please map the Student Name column');
      return;
    }

    if (importType === 'attendance' && !mapping.date && !mapping.presentAbsent) {
      setError('Please map at least Date or Present/Absent column for attendance import');
      return;
    }

    if (importType === 'grades' && (!mapping.subject || !mapping.score)) {
      setError('Please map Subject and Score columns for grades import');
      return;
    }

    setError(null);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('processing');
    setError(null);

    try {
      const response = await fetch('/api/teacher/csv-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: parsedData,
          mapping,
          importType,
          teacherId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setImportResults(result);
      setStep('complete');
      if (onImportComplete) onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to import data');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setHeaders([]);
    setMapping({ studentName: '' });
    setImportType('attendance');
    setError(null);
    setImportResults(null);
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-deep-teal/10 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <h3 className="font-display text-sm font-extrabold text-deep-teal">
            CSV Bulk Import
          </h3>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-[10px] font-semibold text-deep-teal/50">
        <span className={step === 'upload' ? 'text-deep-teal font-bold' : ''}>1. Upload</span>
        <span>→</span>
        <span className={step === 'mapping' ? 'text-deep-teal font-bold' : ''}>2. Map Columns</span>
        <span>→</span>
        <span className={step === 'preview' ? 'text-deep-teal font-bold' : ''}>3. Preview</span>
        <span>→</span>
        <span className={step === 'processing' || step === 'complete' ? 'text-deep-teal font-bold' : ''}>4. Import</span>
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="space-y-4">
          <p className="font-body text-xs text-deep-teal/50 leading-relaxed">
            Upload a CSV file to bulk import attendance or grades data. The system will guide you through mapping columns before committing to the database.
          </p>

          <div className="border-2 border-dashed border-deep-teal/20 rounded-xl p-8 text-center hover:border-deep-teal/40 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-deep-teal/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-deep-teal/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="font-display text-sm font-bold text-deep-teal">
                  Click to upload CSV file
                </p>
                <p className="font-body text-[10px] text-deep-teal/40 mt-1">
                  or drag and drop
                </p>
              </div>
            </label>
          </div>

          <div className="bg-deep-teal/5 rounded-lg p-3 space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40">
              Expected CSV Format
            </p>
            <div className="space-y-1 text-[10px] text-deep-teal/60">
              <p><strong>Attendance:</strong> Student Name, Date, Present/Absent</p>
              <p><strong>Grades:</strong> Student Name, Subject, Score, Date (optional)</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Column Mapping */}
      {step === 'mapping' && (
        <div className="space-y-4">
          <div>
            <label className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 block mb-2">
              Import Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setImportType('attendance')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  importType === 'attendance'
                    ? 'bg-deep-teal border-deep-teal text-white'
                    : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-deep-teal/5'
                }`}
              >
                Attendance
              </button>
              <button
                onClick={() => setImportType('grades')}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  importType === 'grades'
                    ? 'bg-deep-teal border-deep-teal text-white'
                    : 'bg-white border-deep-teal/10 text-deep-teal/70 hover:bg-deep-teal/5'
                }`}
              >
                Grades
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-display text-[9px] font-bold uppercase tracking-wider text-deep-teal/40 block">
              Map CSV Columns to System Fields
            </label>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                  Student Name *
                </label>
                <select
                  value={mapping.studentName}
                  onChange={(e) => setMapping({ ...mapping, studentName: e.target.value })}
                  className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                >
                  <option value="">Select column...</option>
                  {headers.map((header) => (
                    <option key={header} value={header}>
                      {header}
                    </option>
                  ))}
                </select>
              </div>

              {importType === 'attendance' && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                      Date
                    </label>
                    <select
                      value={mapping.date || ''}
                      onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                      className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                      Present/Absent
                    </label>
                    <select
                      value={mapping.presentAbsent || ''}
                      onChange={(e) => setMapping({ ...mapping, presentAbsent: e.target.value })}
                      className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                </select>
                  </div>
                </>
              )}

              {importType === 'grades' && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                      Subject *
                    </label>
                    <select
                      value={mapping.subject || ''}
                      onChange={(e) => setMapping({ ...mapping, subject: e.target.value })}
                      className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                      Score *
                    </label>
                    <select
                      value={mapping.score || ''}
                      onChange={(e) => setMapping({ ...mapping, score: e.target.value })}
                      className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-deep-teal/60 block mb-1">
                      Date (optional)
                    </label>
                    <select
                      value={mapping.date || ''}
                      onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                      className="w-full border border-deep-teal/15 rounded-lg px-3 py-2 text-xs text-deep-teal focus:border-deep-teal/30 focus:outline-none bg-white"
                    >
                      <option value="">Select column...</option>
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleMappingSubmit}
              className="flex-1 bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
            >
              Preview Data
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-xs text-deep-teal/50">
              Found {parsedData.length} rows to import
            </p>
            <button
              onClick={() => setStep('mapping')}
              className="text-[10px] font-bold text-deep-teal/60 hover:text-deep-teal underline"
            >
              Change Mapping
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-deep-teal/10">
            <table className="min-w-max w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="bg-paper border-b border-deep-teal/10 text-deep-teal/50 font-bold uppercase tracking-wider">
                  <th className="p-2">Student Name</th>
                  {importType === 'attendance' && (
                    <>
                      <th className="p-2">Date</th>
                      <th className="p-2">Status</th>
                    </>
                  )}
                  {importType === 'grades' && (
                    <>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Score</th>
                      {mapping.date && <th className="p-2">Date</th>}
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b border-deep-teal/5 hover:bg-paper/30 font-semibold text-deep-teal/80">
                    <td className="p-2">{row[mapping.studentName]}</td>
                    {importType === 'attendance' && (
                      <>
                        <td className="p-2">{mapping.date ? row[mapping.date] : '-'}</td>
                        <td className="p-2">{mapping.presentAbsent ? row[mapping.presentAbsent] : '-'}</td>
                      </>
                    )}
                    {importType === 'grades' && (
                      <>
                        <td className="p-2">{mapping.subject ? row[mapping.subject] : '-'}</td>
                        <td className="p-2">{mapping.score ? row[mapping.score] : '-'}</td>
                        {mapping.date && <td className="p-2">{row[mapping.date]}</td>}
                      </>
                    )}
                  </tr>
                ))}
                {parsedData.length > 5 && (
                  <tr>
                    <td colSpan={importType === 'attendance' ? 3 : mapping.date ? 4 : 3} className="p-2 text-center text-deep-teal/40 italic">
                      ... and {parsedData.length - 5} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-sage/10 text-sage text-[10px] font-semibold px-3 py-2 rounded-lg border border-sage/20 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Review the data above. This will be imported directly into the database and automatically update student status and dashboards.</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 border border-deep-teal/10 hover:bg-deep-teal/5 text-deep-teal/70 font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex-1 bg-sage hover:bg-sage/95 text-white font-display text-xs font-bold py-2.5 rounded-xl transition-all active:scale-95"
            >
              Confirm & Import
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Processing */}
      {step === 'processing' && (
        <div className="text-center py-8 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-deep-teal/5">
            <svg className="w-6 h-6 text-deep-teal animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="font-display text-sm font-bold text-deep-teal">
            Importing data...
          </p>
          <p className="font-body text-xs text-deep-teal/50">
            This may take a few moments
          </p>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && (
        <div className="text-center py-6 space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sage/10">
            <svg className="w-6 h-6 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-display text-sm font-bold text-deep-teal">
              Import Complete!
            </p>
            <p className="font-body text-xs text-deep-teal/50 mt-1">
              {importResults?.success} records imported successfully
              {importResults && importResults.failed > 0 && ` (${importResults.failed} failed)`}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="bg-deep-teal hover:bg-deep-teal/95 text-white font-display text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Import Another File
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-warm-clay/10 text-warm-clay text-[10px] font-semibold px-3 py-2 rounded-lg border border-warm-clay/20 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
