import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { SchoolDayStorySection } from '@/components/landing/SchoolDayStorySection';
import { PlatformSection } from '@/components/landing/PlatformSection';
import { TransitSection } from '@/components/landing/TransitSection';
import { BentoModulesSection } from '@/components/landing/BentoModulesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { LandingMotion } from '@/components/landing/Motion';
import { LandingModalProvider } from '@/components/landing/LandingModalContext';

export default function Home() {
  return (
    <LandingModalProvider>
      <LandingMotion>
        <div className="bg-background text-on-surface font-body-md antialiased overflow-x-hidden">
          <LandingNavbar />
          <main className="pt-20 space-y-4">
            {/* 1. High-Energy Hero Section with Floating Interactive Badges */}
            <HeroSection />

            {/* 2. Emotional Story Arc Timeline: Morning -> Bus -> Gate -> Class -> AI -> Home */}
            <SchoolDayStorySection />

            {/* 3. Revolutionary SchoolGPT Story Flow + 3 Distinct Role Experience Cards */}
            <PlatformSection />

            {/* 4. Dominant 80% Width Interactive Transit Map Showcase */}
            <TransitSection />

            {/* 5. Asymmetrical Bento Workflows Preview */}
            <BentoModulesSection />

            {/* 6. High-Trust Quantifiable Testimonials */}
            <TestimonialsSection />

            {/* 7. Final Action CTA */}
            <CTASection />
          </main>
          {/* 8. Enhanced Footer with Badges, Mini CTA & Contact Info */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
