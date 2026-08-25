import { EcosystemNavbar } from '@/components/landing/ecosystem/EcosystemNavbar';
import { EcosystemHero } from '@/components/landing/ecosystem/EcosystemHero';
import { TheDifferenceSection } from '@/components/landing/ecosystem/TheDifferenceSection';
import { ThreePerspectivesSection } from '@/components/landing/ecosystem/ThreePerspectivesSection';
import { LearningLoopSection } from '@/components/landing/ecosystem/LearningLoopSection';
import { RealProductShowcaseSection } from '@/components/landing/ecosystem/RealProductShowcaseSection';
import { AiEcosystemSection } from '@/components/landing/ecosystem/AiEcosystemSection';
import { OutcomesFeatureSection } from '@/components/landing/ecosystem/OutcomesFeatureSection';
import { FinalCTA } from '@/components/landing/ecosystem/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { LandingMotion } from '@/components/landing/Motion';
import { LandingModalProvider } from '@/components/landing/LandingModalContext';

export default function Home() {
  return (
    <LandingModalProvider>
      <LandingMotion>
        <div className="bg-[#FAF9F6] text-[#172033] font-sans antialiased overflow-x-hidden selection:bg-[#2563EB] selection:text-white">
          {/* Top Sticky Navigation */}
          <EcosystemNavbar />

          <main className="pt-14 sm:pt-16">
            {/* 1. HERO — The school ERP that actually understands learning */}
            <EcosystemHero />

            {/* 2. THE DIFFERENCE — Traditional ERP (Recorded) vs ShikshaSetu (Action) */}
            <TheDifferenceSection />

            {/* 3. ONE STUDENT — THREE PERSPECTIVES — ONE TRUTH */}
            <ThreePerspectivesSection />

            {/* 4. THE LEARNING LOOP — 58% to 78% concrete mastery story */}
            <LearningLoopSection />

            {/* 5. SEE THE REAL PRODUCT — Live portal switcher & actual UI screenshots */}
            <RealProductShowcaseSection />

            {/* 6. AI THAT KNOWS ITS ROLE — Context-grounded intelligence */}
            <AiEcosystemSection />

            {/* 7. WHAT SHIKSHASETU RUNS — 4 compact capability categories */}
            <OutcomesFeatureSection />

            {/* 8. FINAL CTA — Don't just manage your school. Understand every learner. */}
            <FinalCTA />
          </main>

          {/* Clean Footer */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
