import { EcosystemNavbar } from '@/components/landing/ecosystem/EcosystemNavbar';
import { EcosystemHero } from '@/components/landing/ecosystem/EcosystemHero';
import { TheDifferenceSection } from '@/components/landing/ecosystem/TheDifferenceSection';
import { LearningLoopSection } from '@/components/landing/ecosystem/LearningLoopSection';
import { ThreePerspectivesSection } from '@/components/landing/ecosystem/ThreePerspectivesSection';
import { NextBestActionSection } from '@/components/landing/ecosystem/NextBestActionSection';
import { AiEcosystemSection } from '@/components/landing/ecosystem/AiEcosystemSection';
import { RealtimeSyncSection } from '@/components/landing/ecosystem/RealtimeSyncSection';
import { OutcomesFeatureSection } from '@/components/landing/ecosystem/OutcomesFeatureSection';
import { TrustPhilosophySection } from '@/components/landing/ecosystem/TrustPhilosophySection';
import { FinalCTA } from '@/components/landing/ecosystem/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { LandingMotion } from '@/components/landing/Motion';
import { LandingModalProvider } from '@/components/landing/LandingModalContext';

export default function Home() {
  return (
    <LandingModalProvider>
      <LandingMotion>
        <div className="bg-white text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
          {/* 1. Translucent Sticky Ecosystem Navbar */}
          <EcosystemNavbar />

          <main className="pt-16 sm:pt-20">
            {/* 2. WOW Hero: Central Living Student Journey & Connected Roles */}
            <EcosystemHero />

            {/* 3. The Difference: Disconnected Traditional ERP vs Connected Action Loop */}
            <TheDifferenceSection />

            {/* 4. The 7-Step Continuous Learning Cycle */}
            <LearningLoopSection />

            {/* 5. One Student, Three Perspectives, One Truth (Priya Patel 58% Maths) */}
            <ThreePerspectivesSection />

            {/* 6. Signature Next Best Action (Who Needs Me? What Should I Learn? How Can I Help?) */}
            <NextBestActionSection />

            {/* 7. Tri-AI Ecosystem (SchoolMitra, Teacher Copilot, Parent Guide) */}
            <AiEcosystemSection />

            {/* 8. Event-Driven Realtime Sync Lifecycle */}
            <RealtimeSyncSection />

            {/* 9. Grouped Outcomes & Real Capabilities */}
            <OutcomesFeatureSection />

            {/* 10. AI Governance & Philosophy Quote */}
            <TrustPhilosophySection />

            {/* 11. Final Conversion CTA */}
            <FinalCTA />
          </main>

          {/* 12. Full-Featured Footer */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
