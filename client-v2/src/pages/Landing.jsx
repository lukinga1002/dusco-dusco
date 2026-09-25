import React from "react";
import SiteHeader from "@/components/dusco/landing/SiteHeader";
import Hero from "@/components/dusco/landing/Hero";
import Problem from "@/components/dusco/landing/Problem";
import HowItWorks from "@/components/dusco/landing/HowItWorks";
import Features from "@/components/dusco/landing/Features";
import Groups from "@/components/dusco/landing/Groups";
import Trust from "@/components/dusco/landing/Trust";
import Faq from "@/components/dusco/landing/Faq";
import SiteFooter from "@/components/dusco/landing/SiteFooter";

export default function Landing() {
  return (
    <div className="min-h-screen bg-dusco-cream text-dusco-ink font-body">
      <SiteHeader />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <Groups />
      <Trust />
      <Faq />
      <SiteFooter />
    </div>
  );
}