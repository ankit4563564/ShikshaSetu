import { HeroV4 } from '@/components/landing/v4/HeroV4';
import { TrustMetricsV4 } from '@/components/landing/v4/TrustMetricsV4';
import { PlatformOverviewV3 } from '@/components/landing/v4/PlatformOverviewV3';
import { ParentExperienceV4 } from '@/components/landing/v4/ParentExperienceV4';
import { TeacherExperienceV4 } from '@/components/landing/v4/TeacherExperienceV4';
import { SchoolGPTCenterpieceV4 } from '@/components/landing/v4/SchoolGPTCenterpieceV4';
import { ConnectedEcosystemV4 } from '@/components/landing/v4/ConnectedEcosystemV4';
import { BentoModulesV4 } from '@/components/landing/v4/BentoModulesV4';
import { TestimonialsV4 } from '@/components/landing/v4/TestimonialsV4';
import { FinalCTAV4 } from '@/components/landing/v4/FinalCTAV4';
import { FooterV4 } from '@/components/landing/v4/FooterV4';
import { LandingMotion } from '@/components/landing/Motion';

export default function Home() {
  return (
    <LandingMotion>
      <div className="landing-shell min-h-screen overflow-x-hidden bg-[#FAFBFF] font-body text-slate-900">
        <HeroV4 />
        <TrustMetricsV4 />
        <PlatformOverviewV3 />
        <ParentExperienceV4 />
        <TeacherExperienceV4 />
        <SchoolGPTCenterpieceV4 />
        <ConnectedEcosystemV4 />
        <BentoModulesV4 />
        <TestimonialsV4 />
        <FinalCTAV4 />
        <FooterV4 />
      </div>
    </LandingMotion>
  );
}
