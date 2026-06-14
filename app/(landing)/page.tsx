import Hero from "@/components/sections/Hero";
import Showcase from "@/components/sections/Showcase";
import Features from "@/components/sections/Features";
import Reading from "@/components/sections/Reading";
import Experience from "@/components/sections/Experience";
import AppPreview from "@/components/sections/AppPreview";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Showcase />
      <Features />
      <Reading />
      <Experience />
      <AppPreview />
      <CTA />
    </>
  );
}
