import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { TransitSection } from '@/components/landing/TransitSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { LandingMotion } from '@/components/landing/Motion';

export default function Home() {
  return (
    <LandingMotion>
      <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden">
        <LandingNavbar />
        <main className="pt-20">
          <HeroSection />
          <PlatformSection />
          <TransitSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </LandingMotion>
  );
}
