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
        <div className="bg-[#FFF9F0] text-[#102A43] font-sans antialiased overflow-x-hidden selection:bg-[#2563EB] selection:text-white">
          {/* 1. NAVBAR */}
          <EcosystemNavbar />

          <main className="pt-14 sm:pt-16">
            {/* 2. HERO */}
            <EcosystemHero />

            {/* 3. NOT JUST AN ERP */}
            <TheDifferenceSection />

            {/* 4. ONE STUDENT. THREE PERSPECTIVES. ONE TRUTH. */}
            <ThreePerspectivesSection />

            {/* 5. 58% TO 78% MASTERY: THE CONTINUOUS LEARNING LOOP */}
            <LearningLoopSection />

            {/* 6. LOWER TWO-COLUMN MASTER SHOWCASE (matching target reference PNG) */}
            <section className="py-14 md:py-18 bg-[#FFF9F0]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* LEFT COLUMN: See ShikshaSetu in Action + AI With Context */}
                  <div className="lg:col-span-6 space-y-6">
                    <RealProductShowcaseSection />
                    <AiEcosystemSection />
                  </div>

                  {/* RIGHT COLUMN: Capabilities + Don't Just Manage Your School */}
                  <div className="lg:col-span-6 space-y-6">
                    <OutcomesFeatureSection />
                    <FinalCTA />
                  </div>
                </div>
              </div>
            </section>
          </main>

          {/* 7. FOOTER */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
