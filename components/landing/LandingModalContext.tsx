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

      {/* ── WATCH DEMO MODAL ── */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative">
            <button
              onClick={closeDemoModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>
            
            <div className="mb-4">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">Interactive Demo</span>
              <h3 className="text-2xl font-bold text-white mt-1">See one teacher decision update the entire school.</h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Aarav has missed three consecutive assignments. ShikshaSetu detects the pattern, prepares coordinated support, and lets the educator make the final decision.
              </p>
            </div>

            {/* Connected Workflow Visualization */}
            <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mb-4">
              {/* Teacher Card */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3 max-w-[200px] mx-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">KR</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Mrs. Kavita Rao</p>
                    <p className="text-xs text-slate-400">Support plan prepared</p>
                  </div>
                </div>
                <div className="bg-teal-500/10 border border-teal-500/20 rounded px-2 py-1 inline-block">
                  <span className="text-xs text-teal-400">✓ Support plan ready</span>
                </div>
              </div>

              {/* Connection Line */}
              <div className="flex justify-center mb-3">
                <div className="w-px h-3 bg-slate-600"></div>
              </div>

              {/* ShikshaSetu Node */}
              <div className="flex justify-center mb-3">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1.5">
                  <span className="text-xs font-semibold text-purple-400">ShikshaSetu</span>
                </div>
              </div>

              {/* Branching Lines */}
              <div className="flex justify-center mb-3">
                <div className="w-px h-3 bg-slate-600"></div>
              </div>

              {/* Branch visualization */}
              <div className="flex justify-center mb-3">
                <div className="relative w-full max-w-sm h-4">
                  {/* Vertical line from center */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600 -translate-x-1/2"></div>
                  {/* Horizontal branch line */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-600"></div>
                </div>
              </div>

              {/* Three Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Parent */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-emerald-400 text-sm">💬</span>
                    <p className="text-xs font-semibold text-slate-300">PARENT</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">Message prepared</p>
                  <p className="text-[11px] text-slate-400 italic mb-2 line-clamp-2">"Hi Priya, Aarav needs a little support with this week's homework..."</p>
                  <p className="text-[11px] text-emerald-400 mt-auto">Ready</p>
                </div>

                {/* Student */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-amber-400 text-sm">📚</span>
                    <p className="text-xs font-semibold text-slate-300">STUDENT</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">Algebra Recovery Practice</p>
                  <p className="text-[11px] text-slate-400 mb-2">15 min</p>
                  <p className="text-[11px] text-amber-400 mt-auto">Ready</p>
                </div>

                {/* School */}
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-purple-400 text-sm">🏫</span>
                    <p className="text-xs font-semibold text-slate-300">SCHOOL</p>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-1">Support Case #88</p>
                  <p className="text-[11px] text-slate-400 mb-2">Aarav Sharma • Grade 8A</p>
                  <p className="text-[11px] text-purple-400 mt-auto">Ready</p>
                </div>
              </div>

              {/* Outcome */}
              <div className="flex justify-center mt-3 pt-3 border-t border-slate-800">
                <p className="text-[11px] text-slate-400">Outcome recorded → <span className="text-purple-400 font-medium">School Memory</span> learns what worked</p>
              </div>
            </div>

            {/* Primary CTA */}
            <Link
              href="/demo/connected"
              onClick={closeDemoModal}
              className="block w-full bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold text-base text-center transition-colors mb-2"
            >
              ▶ Try It Yourself — 60 Seconds
            </Link>

            {/* Helper Text */}
            <p className="text-xs text-slate-400 text-center mb-2">
              No setup · Fully interactive · You control the workflow
            </p>

            {/* Secondary Action */}
            <button
              onClick={() => {
                closeDemoModal();
              }}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Explore individual portals →
            </button>
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
