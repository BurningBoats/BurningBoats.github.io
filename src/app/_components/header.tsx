"use client";

import Image from "next/image";

export default function Header() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-3 shadow-md text-bb">
      <div className="text-lg font-bold">
        <Image
          src="/logo.svg"
          width={300}
          height={300}
          alt="Burning Boats Logo"
          className="h-16 w-auto"
        />
      </div>
      <nav className="space-x-6 text-lg">
        <button onClick={() => scrollToSection("hero")}>Home</button>
        <button onClick={() => scrollToSection("projects")}>Projects</button>
        {/* <button onClick={() => scrollToSection("team")}>Team</button> */}
        <button onClick={() => scrollToSection("footer")}>Contact us</button>
      </nav>
    </header>
  );
}