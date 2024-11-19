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
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
      {/* Logo */}
      <div className="mb-6">
        <Image
          src="/icon_large.svg"
          alt="Burning Boats Logo"
          width={150}
          height={150}
          className="w-24 h-24 md:w-32 md:h-32"
        />
      </div>

      {/* 404 Text */}
      <h1 className="text-5xl font-bold text-bb mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        Oops! The page you're looking for doesn't exist.
      </p>

      {/* Button */}
      <button
        onClick={handleGoBack}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200"
      >
        Go Back
      </button>
    </div>
  );
}
