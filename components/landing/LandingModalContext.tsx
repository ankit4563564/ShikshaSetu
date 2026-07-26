'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import Link from 'next/link';
import { SchoolStoryModal } from '@/components/onboarding/SchoolStoryModal';
import { OnboardingMotionProvider } from '@/components/onboarding/motion/OnboardingMotionProvider';
import type { OnboardingPhase } from '@/components/onboarding/types';

interface FeatureModalInfo {
  title: string;
  category: string;
  badge: string;
  description: string;
  details: string[];
  metrics: { label: string; value: string }[];
  actionHref?: string;
  actionText?: string;
}

interface CaseStudyInfo {
  author: string;
  role: string;
  quote: string;
  outcome: string;
  school: string;
  photo: string;
  fullStory: string[];
  keyResults: { metric: string; detail: string }[];
}

interface MetricInfo {
  metric: string;
  label: string;
  description: string;
  highlights: string[];
}

interface LandingModalContextType {
  openRoleSelector: () => void;
  closeRoleSelector: () => void;
  openLeadModal: (title?: string) => void;
  closeLeadModal: () => void;
  openDemoModal: () => void;
  closeDemoModal: () => void;
  openFeatureModal: (data: FeatureModalInfo) => void;
  closeFeatureModal: () => void;
  openCaseStudy: (data: CaseStudyInfo) => void;
  closeCaseStudy: () => void;
  openMetricModal: (data: MetricInfo) => void;
  closeMetricModal: () => void;
}

const LandingModalContext = createContext<LandingModalContextType | undefined>(undefined);

export function LandingModalProvider({ children }: { children: React.ReactNode }) {
  const [isRoleSelectorOpen, setIsRoleSelectorOpen] = useState(false);
  const [storyPhase, setStoryPhase] = useState<OnboardingPhase>('closed');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadModalTitle, setLeadModalTitle] = useState('Book a Live School Demo');
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [featureModalData, setFeatureModalData] = useState<FeatureModalInfo | null>(null);
  const [caseStudyData, setCaseStudyData] = useState<CaseStudyInfo | null>(null);
  const [metricData, setMetricData] = useState<MetricInfo | null>(null);

  // Lead form state
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false);

  const openRoleSelector = useCallback(() => {
    setStoryPhase('opening');
    setIsRoleSelectorOpen(true);
  }, []);

  const closeRoleSelector = useCallback(() => {
    setIsRoleSelectorOpen(false);
    setTimeout(() => setStoryPhase('closed'), 320);
  }, []);

  const openLeadModal = (title = 'Book a Live School Demo') => {
    setLeadModalTitle(title);
    setLeadFormSubmitted(false);
    setIsLeadModalOpen(true);
  };
  const closeLeadModal = () => setIsLeadModalOpen(false);

  const openDemoModal = () => setIsDemoModalOpen(true);
  const closeDemoModal = () => setIsDemoModalOpen(false);

  const openFeatureModal = (data: FeatureModalInfo) => setFeatureModalData(data);
  const closeFeatureModal = () => setFeatureModalData(null);

  const openCaseStudy = (data: CaseStudyInfo) => setCaseStudyData(data);
  const closeCaseStudy = () => setCaseStudyData(null);

  const openMetricModal = (data: MetricInfo) => setMetricData(data);
  const closeMetricModal = () => setMetricData(null);

  return (
    <LandingModalContext.Provider
      value={{
        openRoleSelector,
        closeRoleSelector,
        openLeadModal,
        closeLeadModal,
        openDemoModal,
        closeDemoModal,
        openFeatureModal,
        closeFeatureModal,
        openCaseStudy,
        closeCaseStudy,
        openMetricModal,
        closeMetricModal,
      }}
    >
      {children}

      {/* ── IMMERSIVE SCHOOL STORY ONBOARDING OVERLAY ── */}
      <OnboardingMotionProvider>
        <SchoolStoryModal
          open={isRoleSelectorOpen}
          phase={storyPhase}
          onClose={closeRoleSelector}
          onPhaseChange={setStoryPhase}
          landingTargetClass="landing-shell"
        />
      </OnboardingMotionProvider>

      {/* ── LEAD GENERATION / BOOK DEMO MODAL ── */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeLeadModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <div className="mb-6">
              <span className="text-xs font-mono font-bold text-secondary-container uppercase tracking-wider">Start Your Journey</span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">{leadModalTitle}</h3>
              <p className="text-sm text-slate-300 mt-1">Connect with our school deployment specialists for a personalized live walkthrough.</p>
            </div>

            {leadFormSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 font-bold text-2xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-white">Demo Booking Confirmed!</h4>
                <p className="text-xs text-slate-300">Our team will reach out to your school within 2 hours. You can also explore our live interactive portals anytime.</p>
                <button
                  onClick={closeLeadModal}
                  className="mt-4 bg-emerald-500 text-slate-950 px-6 py-2 rounded-full font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setLeadFormSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Principal Sunita Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-secondary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">School Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Delhi Public School, Sector 45"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-secondary-container"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-secondary-container"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed py-3 rounded-xl font-bold text-sm transition-colors mt-2"
                >
                  Request Live Demo →
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── WATCH DEMO VIDEO MODAL ── */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative">
            <button
              onClick={closeDemoModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <div className="mb-4">
              <span className="text-xs font-mono font-bold text-secondary-container uppercase tracking-wider">7-Minute Connected Day Tour</span>
              <h3 className="text-xl font-bold text-white mt-1">Walk a Full School Day in Seven Minutes</h3>
            </div>
            
            {/* Interactive Video Simulation Screen */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-between p-6">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Live Product Walkthrough
                </span>
                <span>Scene 01: Morning Bus Boarding</span>
              </div>

              <div className="text-center my-auto space-y-3">
                <div className="w-16 h-16 rounded-full bg-secondary-container text-slate-950 font-bold text-2xl flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                  ▶
                </div>
                <h4 className="text-lg font-bold text-white">Interactive Demonstration Environment Active</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Experience how gate entry scans, live bus GPS, teacher AI tools, and parent alerts sync seamlessly in real time.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <Link
                  href="/parent"
                  onClick={closeDemoModal}
                  className="bg-secondary-container text-slate-950 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Step Into Parent App →
                </Link>
                <Link
                  href="/admin"
                  onClick={closeDemoModal}
                  className="bg-slate-800 text-white hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Step Into Admin Console →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURE DETAIL MODAL ── */}
      {featureModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeFeatureModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            <div className="mb-4">
              <span className="text-xs font-mono font-bold text-secondary-container uppercase tracking-wider">{featureModalData.category}</span>
              <h3 className="text-2xl font-bold text-white mt-1">{featureModalData.title}</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{featureModalData.description}</p>
            </div>

            {/* Feature Metrics */}
            {featureModalData.metrics.length > 0 && (
              <div className="grid grid-cols-2 gap-3 my-4">
                {featureModalData.metrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="block text-xs text-slate-400 font-mono">{m.label}</span>
                    <span className="text-lg font-bold text-secondary-fixed">{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Feature Highlights */}
            <div className="space-y-2 my-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Key Capabilities</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {featureModalData.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              {featureModalData.actionHref ? (
                <Link
                  href={featureModalData.actionHref}
                  onClick={closeFeatureModal}
                  className="w-full bg-secondary-container text-slate-950 py-3 rounded-xl font-bold text-xs text-center hover:bg-secondary-fixed transition-colors"
                >
                  {featureModalData.actionText || 'Open Live Application →'}
                </Link>
              ) : (
                <button
                  onClick={closeFeatureModal}
                  className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Close Preview
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CASE STUDY MODAL ── */}
      {caseStudyData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeCaseStudy}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-secondary-container shrink-0">
                <img src={caseStudyData.photo} alt={caseStudyData.author} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-secondary-container uppercase">{caseStudyData.school}</span>
                <h3 className="text-xl font-bold text-white">{caseStudyData.author}</h3>
                <p className="text-xs text-slate-400">{caseStudyData.role}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-secondary-container/10 border border-secondary-container/30 mb-6">
              <p className="text-base font-extrabold text-secondary-fixed">&ldquo;{caseStudyData.outcome}&rdquo;</p>
              <p className="text-xs text-slate-300 italic mt-2">&ldquo;{caseStudyData.quote}&rdquo;</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed mb-6">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Full Case Study</h4>
              {caseStudyData.fullStory.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800">
              {caseStudyData.keyResults.map((r) => (
                <div key={r.metric} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="block text-lg font-extrabold text-emerald-400">{r.metric}</span>
                  <span className="text-[10px] text-slate-400">{r.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── METRIC DETAIL MODAL ── */}
      {metricData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={closeMetricModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-secondary-container font-mono">{metricData.metric}</span>
              <h3 className="text-xl font-bold text-white mt-1">{metricData.label}</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">{metricData.description}</p>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Platform Evidence</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {metricData.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={closeMetricModal}
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
            >
              Close Metric Breakdown
            </button>
          </div>
        </div>
      )}

    </LandingModalContext.Provider>
  );
}

export function useLandingModal() {
  const context = useContext(LandingModalContext);
  if (!context) {
    throw new Error('useLandingModal must be used within LandingModalProvider');
  }
  return context;
}
