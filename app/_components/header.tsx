"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const scrollToSection = (sectionId: string) => {
    const navigateAndScroll = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        setIsMenuOpen(false); // Close the menu after navigating
      }
    };

    if (pathname !== "/") {
      router.push("/"); // Navigate to home if not already there
      setTimeout(navigateAndScroll, 100); // Wait for the page to load before scrolling
    } else {
      navigateAndScroll();
    }
  };

  return (
    <header className="sticky top-0 bg-white z-10 flex items-center justify-between px-6 py-3 shadow-md text-bb">
      {/* Logo */}
      <div className="text-lg font-bold">
        <button
          onClick={() => scrollToSection("hero")}
          className="focus:outline-none"
        >
          <Image
            src="/logo.svg"
            alt="Burning Boats Logo"
            width={300}
            height={300}
            className="h-16 w-auto"
            priority
          />
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex space-x-6 text-lg">
        <button onClick={() => scrollToSection("hero")}>Home</button>
        <button onClick={() => scrollToSection("projects")}>Projects</button>
        <button onClick={() => scrollToSection("contacts")}>Contact us</button>
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
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contacts")}
                  className="block w-full px-4 py-2 hover:bg-gray-100 text-left"
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
