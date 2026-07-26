import { HeroV4 } from '@/components/landing/v4/HeroV4';
import { TrustMetricsV4 } from '@/components/landing/v4/TrustMetricsV4';
import { SchoolDayScene1_Morning } from '@/components/landing/story/SchoolDayScene1_Morning';
import { SchoolDayScene2_Classroom } from '@/components/landing/story/SchoolDayScene2_Classroom';
import { SchoolDayScene3_SchoolGPT } from '@/components/landing/story/SchoolDayScene3_SchoolGPT';
import { SchoolDayScene4_Evening } from '@/components/landing/story/SchoolDayScene4_Evening';
import { SchoolDayScene5_Outcomes } from '@/components/landing/story/SchoolDayScene5_Outcomes';
import { BentoModulesV4 } from '@/components/landing/v4/BentoModulesV4';
import { FinalCTAV4 } from '@/components/landing/v4/FinalCTAV4';
import { FooterV4 } from '@/components/landing/v4/FooterV4';
import { LandingMotion } from '@/components/landing/Motion';

export default function Home() {
  return (
    <LandingMotion>
      <div className="landing-shell min-h-screen overflow-x-hidden bg-[#FAFBFF] font-body text-slate-900">
        <HeroV4 />
        <TrustMetricsV4 />
        
        {/* "One Connected School Day" 5-Scene Interactive Story Movie */}
        <SchoolDayScene1_Morning />
        <SchoolDayScene2_Classroom />
        <SchoolDayScene3_SchoolGPT />
        <SchoolDayScene4_Evening />
        <SchoolDayScene5_Outcomes />

        <BentoModulesV4 />
        <FinalCTAV4 />
        <FooterV4 />
      </div>
    </LandingMotion>
  );
}
