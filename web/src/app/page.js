import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <main className="bg-canvas">
      <Hero />
      <HowItWorks />
      <Footer />
    </main>
  );
}