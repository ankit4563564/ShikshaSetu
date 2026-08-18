'use client';

import React, { useState, useRef } from 'react';
import type { ConceptMindMap } from '@/lib/mindmap/types';
import VisualMindMapCanvas from './VisualMindMapCanvas';
import MindMapExportModal from './MindMapExportModal';
import { generateMindMapAction } from '@/app/actions/mindmapActions';
import { extractTextFromFile } from '@/lib/mindmap/fileTextExtractor';

type ProcessingStep = 'idle' | 'uploading' | 'reading' | 'extracting' | 'generating' | 'ready' | 'error';

interface StoredMindMapItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  createdAt: string;
  mindMap: ConceptMindMap;
}

export default function VisualMindMapWorkspace() {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>('');
  const [subject, setSubject] = useState<string>('General Science');
  const [grade, setGrade] = useState<string>('8');
  const [pastedText, setPastedText] = useState<string>('');

  // Map state
  const [activeMindMap, setActiveMindMap] = useState<ConceptMindMap | null>(null);
  const [savedMaps, setSavedMaps] = useState<StoredMindMapItem[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setErrorText(null);

    // Try extracting probable title from file name
    const inferred = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
    if (!title) {
      setTitle(inferred.charAt(0).toUpperCase() + inferred.slice(1));
    }
  };

  const handleProcessAndGenerate = async () => {
    setErrorText(null);
    let contentToProcess = pastedText.trim();
    let currentTitle = title.trim();

    try {
      if (activeTab === 'upload') {
        if (!selectedFile) {
          setErrorText('Please select a file (PDF, DOCX, or TXT) to upload.');
          return;
        }

        setProcessingStep('uploading');
        setStatusMessage(`Uploading ${selectedFile.name}...`);
        await new Promise((r) => setTimeout(r, 400));

        setProcessingStep('reading');
        setStatusMessage('Reading and extracting notes from document...');
        const extracted = await extractTextFromFile(selectedFile);
        contentToProcess = extracted.text;
        if (!currentTitle) {
          currentTitle = extracted.inferredTitle;
          setTitle(currentTitle);
        }
      } else {
        if (!contentToProcess || contentToProcess.length < 20) {
          setErrorText('Please enter your notes text (at least 20 characters) to generate a revision sheet.');
          return;
        }
        if (!currentTitle) {
          currentTitle = 'Chapter Revision Notes';
          setTitle(currentTitle);
        }
      }

      setProcessingStep('extracting');
      setStatusMessage('Extracting concepts, key definitions, formulas & relationships...');
      await new Promise((r) => setTimeout(r, 500));

      setProcessingStep('generating');
      setStatusMessage('Building 1-page visual revision concept sheet...');

      const result = await generateMindMapAction({
        title: currentTitle,
        subject: subject.trim() || 'General Science',
        grade: grade.trim() || '8',
        rawNotes: contentToProcess,
      });

      if (!result.success || !result.mindMap) {
        throw new Error(result.error || 'Failed to generate visual revision map.');
      }

      const newMap = result.mindMap;
      setActiveMindMap(newMap);

      // Save to session history
      const savedItem: StoredMindMapItem = {
        id: `map-${Date.now()}`,
        title: newMap.title,
        subject: newMap.subject,
        grade: newMap.grade,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mindMap: newMap,
      };

      setSavedMaps((prev) => [savedItem, ...prev.filter((m) => m.title !== newMap.title)]);
      setProcessingStep('ready');
    } catch (err: any) {
      console.error('[VisualMindMapWorkspace] Generation error:', err);
      setProcessingStep('error');
      setErrorText(err.message || "We couldn't generate the revision map from this file.");
    }
  };

  const handleResetToUpload = () => {
    setActiveMindMap(null);
    setProcessingStep('idle');
    setSelectedFile(null);
    setPastedText('');
    setTitle('');
    setErrorText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isProcessing = ['uploading', 'reading', 'extracting', 'generating'].includes(processingStep);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* ── TOP HEADER & RECENT MAPS BAR ── */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider">
                🗺️ Visual Revision Mind Map
              </span>
              {activeMindMap && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase border border-emerald-200">
                  Active Map: {activeMindMap.title}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight mt-2">
              Visual Revision Concept Sheets
            </h1>
            <p className="font-body text-xs text-slate-500 font-medium max-w-2xl mt-1 leading-relaxed">
              Upload your textbook chapters, study notes, or PDFs to transform them into dense 1-page visual revision posters with formulas, diagrams, and key concepts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeMindMap && (
              <button
                type="button"
                onClick={handleResetToUpload}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>+ Upload New Notes</span>
              </button>
            )}
          </div>
        </div>

        {/* ── RECENT USER MAPS LIST (EMPTY IF NO MAPS GENERATED) ── */}
        {savedMaps.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-400 shrink-0">Recent Maps:</span>
            {savedMaps.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveMindMap(item.mindMap);
                  setProcessingStep('ready');
                  setErrorText(null);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all border shrink-0 ${
                  activeMindMap?.title === item.title
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                📄 {item.title} ({item.subject})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 1. EMPTY STATE / UPLOAD FLOW (SHOWN WHEN NO ACTIVE MAP) ── */}
      {!activeMindMap && !isProcessing && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shadow-2xs">
              📚
            </div>
            <h2 className="font-display text-xl font-black text-slate-900 tracking-tight">
              Turn your notes into a visual revision sheet
            </h2>
            <p className="font-body text-xs text-slate-500 max-w-lg mx-auto">
              Upload a chapter PDF, DOCX, or paste study notes to extract key concepts, mathematical formulas, and relationships onto a single sheet.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center">
            <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-5 py-2 rounded-xl transition-all ${
                  activeTab === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                📁 Upload Document (PDF / DOCX / TXT)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-5 py-2 rounded-xl transition-all ${
                  activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                ✍️ Paste Notes Text
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="max-w-2xl mx-auto p-8 rounded-3xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-all text-center cursor-pointer space-y-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="text-4xl">📄</div>
              {selectedFile ? (
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 inline-block">
                    ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                  <p className="text-[11px] text-slate-400">Click to change file</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Click to select notes document or drag and drop
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Supports PDF, DOCX, and TXT files (up to 25MB)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Notes / Chapter Content
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste chapter notes, summary definitions, or formulas here..."
                className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none bg-slate-50/50"
              />
            </div>
          )}

          {/* Optional Chapter Metadata */}
          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Chapter Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Trigonometry"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Grade
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g., 10"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>

          {errorText && (
            <div className="max-w-2xl mx-auto p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
              <span>⚠️ {errorText}</span>
              <button onClick={() => setErrorText(null)} className="text-rose-600 hover:underline">Dismiss</button>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="max-w-2xl mx-auto text-center pt-2">
            <button
              type="button"
              onClick={handleProcessAndGenerate}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-display text-xs font-black tracking-wide transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Generate Revision Concept Map ✨
            </button>
          </div>
        </div>
      )}

      {/* ── 2. REAL PROCESSING PROGRESS STATE ── */}
      {isProcessing && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center space-y-6 shadow-xs max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-3xl shadow-xs animate-bounce">
            ⚙️
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-lg font-black text-slate-900">
              Processing Uploaded Notes
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {statusMessage}
            </p>
          </div>

          {/* Actual Steps Indicator */}
          <div className="grid grid-cols-4 gap-2 pt-4">
            <div className={`p-2 rounded-xl text-[10px] font-bold border ${processingStep === 'uploading' ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              1. Upload
            </div>
            <div className={`p-2 rounded-xl text-[10px] font-bold border ${processingStep === 'reading' ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              2. Read Notes
            </div>
            <div className={`p-2 rounded-xl text-[10px] font-bold border ${processingStep === 'extracting' ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              3. Extract
            </div>
            <div className={`p-2 rounded-xl text-[10px] font-bold border ${processingStep === 'generating' ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
              4. Build Sheet
            </div>
          </div>
        </div>
      )}

      {/* ── 3. VISUAL CANVAS (RENDERED ONLY WHEN A REAL MAP IS ACTIVE) ── */}
      {activeMindMap && !isProcessing && (
        <div className="h-[750px] w-full">
          <VisualMindMapCanvas
            mindMap={activeMindMap}
            onExportPdf={() => setIsExportModalOpen(true)}
          />
        </div>
      )}

      {/* ── 4. EXPORT MODAL ── */}
      {activeMindMap && (
        <MindMapExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          mindMap={activeMindMap}
        />
      )}
    </div>
  );
}
