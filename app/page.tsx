import { EcosystemNavbar } from '@/components/landing/ecosystem/EcosystemNavbar';
import { EcosystemHero } from '@/components/landing/ecosystem/EcosystemHero';
import { TheProblemSection } from '@/components/landing/ecosystem/TheProblemSection';
import { TheDifferenceSection } from '@/components/landing/ecosystem/TheDifferenceSection';
import { ThreePerspectivesSection } from '@/components/landing/ecosystem/ThreePerspectivesSection';
import { RealStudentExampleSection } from '@/components/landing/ecosystem/RealStudentExampleSection';
import { LearningLoopSection } from '@/components/landing/ecosystem/LearningLoopSection';
import { AiEcosystemSection } from '@/components/landing/ecosystem/AiEcosystemSection';
import { DataProvenanceSection } from '@/components/landing/ecosystem/DataProvenanceSection';
import { RealProductShowcaseSection } from '@/components/landing/ecosystem/RealProductShowcaseSection';
import { WhatWeConnectSection } from '@/components/landing/ecosystem/WhatWeConnectSection';
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
            {/* 1. HERO */}
            <EcosystemHero />

            {/* 2. THE PROBLEM */}
            <TheProblemSection />

            {/* 3. DIFFERENTIATION: NOT JUST AN ERP */}
            <TheDifferenceSection />

            {/* 4. CONNECTED STUDENT JOURNEY: THREE PERSPECTIVES */}
            <ThreePerspectivesSection />

            {/* 5. REAL STUDENT EXAMPLE: DATA BECOMES ACTION */}
            <RealStudentExampleSection />

            {/* 6. CONTINUOUS LEARNING LOOP */}
            <LearningLoopSection />

            {/* 7. AI WITH CONTEXT (NOT JUST A CHATBOT) */}
            <AiEcosystemSection />

            {/* 8. DATA PROVENANCE (COMES FROM THE SCHOOL) */}
            <DataProvenanceSection />

            {/* 9. ACTUAL PRODUCT PROOF */}
            <RealProductShowcaseSection />

            {/* 10 & 11. WHAT WE CONNECT & WHY SCHOOLS USE IT */}
            <WhatWeConnectSection />

            {/* 12. FINAL CTA */}
            <FinalCTA />
          </main>

          {/* FOOTER */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
