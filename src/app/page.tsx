"use client";

import Footer from "./_components/footer";
import Header from "./_components/header";
import HeroSection from "./_components/hero";
import ProjectsSection from "./_components/projects";
import TeamSection from "./_components/team";

export default function Home() {
  return (
    <div className="h-screen overflow-y-auto no-scrollbar">
      <main>
        <Header />
        <HeroSection />
        <ProjectsSection/>
        <TeamSection/>
        <Footer />
      </main>
    </div>
  );
}