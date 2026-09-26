import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HeroContent } from "@/components/landing/HeroContent";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForWhom } from "@/components/landing/ForWhom";
import { Benefits } from "@/components/landing/Benefits";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HeroContent />
      <HowItWorks />
      <ForWhom />
      <Benefits />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
