import { HeroSection } from '@/components/landing/hero-section';
import { UpcomingHackathons } from '@/components/landing/upcoming-hackathons';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorks } from '@/components/landing/how-it-works';
import { TrustedBy } from '@/components/landing/trusted-by';
import { Testimonials } from '@/components/landing/testimonials';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <main className="flex-grow">
        <HeroSection />
        <UpcomingHackathons />
        <FeaturesSection />
        <HowItWorks />
        <TrustedBy />
        <Testimonials />
      </main>
    </div>
  );
}
