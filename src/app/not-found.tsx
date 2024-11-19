"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    if (document.referrer) {
      window.history.back(); // Goes back to the previous page
    } else {
      router.push("/"); // Redirects to the home page if no referrer
    }
  };

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-screen bg-gray-100 text-center px-6">
      {/* Icon */}
      <div className="mb-6 lg:mb-0 lg:mr-8">
        <Image
          src="/icon_large.svg"
          alt="Burning Boats Logo"
          width={200}
          height={200}
          className="w-48 h-48 md:w-64 md:h-64"
        />
      </div>

      {/* Text Section */}
      <div className="flex flex-col items-center lg:items-start">
        <h1 className="text-5xl font-bold text-bb mb-4">404</h1>
        <h2 className="text-3xl text-bb mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-6 max-w-md">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might
          have been moved, or the URL might be incorrect.
        </p>

        {/* Button */}
        <button
          onClick={handleGoBack}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded hover:scale-105 shadow-lg transition-transform duration-300"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
