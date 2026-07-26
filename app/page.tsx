import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import SchoolGPTShowcase from '@/components/landing/SchoolGPTShowcase';
import LiveTransitSection from '@/components/landing/LiveTransitSection';
import DualPortalSection from '@/components/landing/DualPortalSection';
import ConnectedJourney from '@/components/landing/ConnectedJourney';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import { LandingMotion } from '@/components/landing/Motion';

export default function Home() {
  return (
    <LandingMotion>
      <div className="landing-shell min-h-screen overflow-x-hidden bg-paper font-body text-ink">
        <Navbar />
        <Hero />
        <SchoolGPTShowcase />
        <LiveTransitSection />
        <DualPortalSection />
        <ConnectedJourney />
        <CTA />
        <Footer />
      </div>
    </LandingMotion>
  );
}
