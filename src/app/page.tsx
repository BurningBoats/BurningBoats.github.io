"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

export default function Home() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY) {
        setShowNavbar(false); // Hide navbar
      } else {
        setShowNavbar(true); // Show navbar
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="scroll-container">
      <style jsx global>{`
        .scroll-container {
          overflow-y: scroll;
          height: 100vh;
        }
        .scroll-container::-webkit-scrollbar {
          width: 0;
          background: transparent;
        }
        .scroll-container {
          scrollbar-width: none;
        }
        .scroll-container::-webkit-scrollbar-thumb {
          display: none;
        }
      `}</style>

      <header
        className={`bg-white text-bb shadow-md transform transition-transform duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        } sticky top-0 z-10`}
      >
        <nav className="container mx-auto flex items-center justify-between py-2 px-4 flex-wrap md:flex-nowrap">
          <div className="text-lg font-bold">
            <Image
              src="/images/logo.svg"
              width={200}
              height={200}
              alt="Company Logo"
            />
          </div>
          <div className="flex space-x-4 md:space-x-6">
            <button
              className="text-black hover:text-gray-600 px-4"
              onClick={() => scrollToSection("section1")}
            >
              Home
            </button>
            <button
              className="text-black hover:text-gray-600 px-4"
              onClick={() => scrollToSection("section2")}
            >
              About
            </button>
            <button
              className="text-black hover:text-gray-600 px-4"
              onClick={() => scrollToSection("section3")}
            >
              Contact Us
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="section1"
          className="h-screen bg-blue-100 flex items-center justify-center"
        >
          <h1 className="text-4xl">Welcome to Section 1</h1>
        </section>
        <section
          id="section2"
          className="h-screen bg-blue-200 flex items-center justify-center"
        >
          <h1 className="text-4xl">Welcome to Section 2</h1>
        </section>
        <section
          id="section3"
          className="h-screen bg-blue-300 flex items-center justify-center"
        >
          <h1 className="text-4xl">Welcome to Section 3</h1>
        </section>
      </main>
    </div>
  );
}
