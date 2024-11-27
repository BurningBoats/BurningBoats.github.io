"use client";

import HeroSection from '@components/hero'
import ProjectsSection from "@components/projects";
import ContactSection from "@components/contacts";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProjectsSection/>
      <ContactSection/>
    </>
  );
}