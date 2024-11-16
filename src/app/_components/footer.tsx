import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export default function Footer() {
  return (
    <footer id="footer" className="bg-gray-900 text-white py-12">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Social Media Buttons */}
        <div className="flex space-x-6">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition duration-200"
          >
            <FaTwitter size={24} />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-600 transition duration-200"
          >
            <FaLinkedin size={24} />
          </a>
          <a
            href="https://github.com/BurningBoats/BurningBoats.github.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 transition duration-200"
          >
            <FaGithub size={24} />
          </a>
        </div>

        {/* Copyright Notice */}
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Burning Boats. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
