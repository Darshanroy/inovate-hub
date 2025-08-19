import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { TrustedBy } from "@/components/landing/trusted-by";
import { UpcomingHackathons } from "@/components/landing/upcoming-hackathons";

export default function LandingPage() {
  return (
    <div className="flex-1">
      <HeroSection />
      <TrustedBy />
      <FeaturesSection />
      <UpcomingHackathons />
      <HowItWorks />
      <Testimonials />
    </div>
  )
}
