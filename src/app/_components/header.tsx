"use client";

import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false); // Close the menu after clicking a link
    }
  };

  return (
    <header className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-3 shadow-md text-bb">
      {/* Logo */}
      <div className="text-lg font-bold">
        <Image
          src="/logo.svg"
          alt="Burning Boats Logo"
          width={300}
          height={300}
          className="h-16 w-auto"
          priority
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex space-x-6 text-lg">
        <button onClick={() => scrollToSection("hero")}>Home</button>
        <button onClick={() => scrollToSection("projects")}>Projects</button>
        <button onClick={() => scrollToSection("footer")}>Contact us</button>
      </nav>

      {/* Mobile Navigation */}
      <div className="relative lg:hidden">
        {/* Burger Button */}
        <button
          onClick={toggleMenu}
          className="text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          ☰
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-lg">
            <ul className="flex flex-col space-y-2 py-2 text-center">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("footer")}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Contact us
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
