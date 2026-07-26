import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ExperienceHubSection } from '@/components/landing/ExperienceHubSection';
import { SchoolDayStorySection } from '@/components/landing/SchoolDayStorySection';
import { SchoolGPTSection } from '@/components/landing/SchoolGPTSection';
import { TransitSection } from '@/components/landing/TransitSection';
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
            {/* 1. High-Energy Hero Section */}
            <HeroSection />

            {/* 2. 1-Click Experience Hub for Hackathon Judges (Parent, Teacher, Admin, SchoolGPT) */}
            <ExperienceHubSection />

            {/* 3. Compressed Connected School Day Timeline Arc */}
            <div id="school-story">
              <SchoolDayStorySection />
            </div>

            {/* 4. Live Interactive SchoolGPT Console */}
            <SchoolGPTSection />

            {/* 5. Dominant 80% Width Interactive Transit Map Showcase */}
            <TransitSection />

            {/* 6. High-Trust Quantifiable Outcomes & Testimonials */}
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
