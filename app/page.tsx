import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { DualExperienceHubSection } from '@/components/landing/DualExperienceHubSection';
import { SchoolDayStorySection } from '@/components/landing/SchoolDayStorySection';
import { SchoolGPTSection } from '@/components/landing/SchoolGPTSection';
import { TransitSection } from '@/components/landing/TransitSection';
import { AdminOperationsSection } from '@/components/landing/AdminOperationsSection';
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

            {/* 2. Dual-Experience Hub (Parent & Teacher Dual Showcase Connected by SchoolGPT) */}
            <DualExperienceHubSection />

            {/* 3. Connected School Day Timeline Arc */}
            <div id="school-story">
              <SchoolDayStorySection />
            </div>

            {/* 4. Ambient SchoolGPT Intelligence Console */}
            <SchoolGPTSection />

            {/* 5. Dominant 80% Width Interactive Transit Map Showcase */}
            <TransitSection />

            {/* 6. Supporting Infrastructure & Admin Automation */}
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter pt-8">
              <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">SUPPORTING INFRASTRUCTURE</span>
                <h3 className="text-2xl font-bold font-display text-slate-900">Everything is Synchronized Automatically</h3>
                <p className="text-xs text-slate-600 font-medium">Gate security, transport telemetry, fee ledgers, and campus administration run seamlessly behind the scenes.</p>
              </div>
              <AdminOperationsSection />
            </div>

            {/* 7. High-Trust Quantifiable Outcomes & Testimonials */}
            <TestimonialsSection />

            {/* 8. Final Action CTA */}
            <CTASection />
          </main>
          {/* 9. Enhanced Footer with Badges, Mini CTA & Contact Info */}
          <Footer />
        </div>
      </LandingMotion>
    </LandingModalProvider>
  );
}
