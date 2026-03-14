import Background from "@/components/Background";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { AIChat } from "@/components/AIChat";
import { Benefits } from "@/components/Benefits";
import { Ecosystem } from "@/components/Ecosystem";
import { Footer } from "@/components/Footer";
import { WallOfFame } from "@/components/WallOfFame";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      {/* 3D Particle Background Overlay */}
      <Background />
      
      {/* Interactive Overlay Content */}
      <div className="relative w-full z-10 font-sans">
        <Hero />
        <HowItWorks />
        <AIChat />
        <Benefits />
        <Ecosystem />
        <WallOfFame />
        <Footer />
      </div>
    </main>
  );
}
