import Image from "next/image";
import {
  FaFacebook,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaInstagram,
  FaDiscord,
} from "react-icons/fa";
import { SiItchdotio } from "react-icons/si"; // Icon for Itch.io

export default function TeamSection() {
  const teamMembers = [
    {
      name: "Andrea Conde",
      role: "Concept Artist",
      image: "/images/htph.jpeg",
      links: [
        { platform: "Instagram", url: "https://instagram.com", icon: FaInstagram },
        { platform: "LinkedIn", url: "https://linkedin.com", icon: FaLinkedin },
        { platform: "Itch.io", url: "https://itch.io", icon: SiItchdotio },
      ],
    },
    {
      name: "Andres Briseño",
      role: "AI Programmer",
      image: "/images/htph.jpeg",
      links: [{ platform: "GitHub", url: "https://github.com", icon: FaGithub }],
    },
    {
      name: "Joe Magnani",
      role: "Biz Dev",
      image: "/images/htph.jpeg",
      links: [
        { platform: "Discord", url: "https://discord.com", icon: FaDiscord },
        { platform: "Facebook", url: "https://facebook.com", icon: FaFacebook },
      ],
    },
    {
      name: "Juan Muniain",
      role: "3D Artist",
      image: "/images/htph.jpeg",
      links: [
        
      ],
    },
    {
      name: "Luis J. Karam",
      role: "Sound Designer",
      image: "/images/htph.jpeg",
      links: [
        { platform: "LinkedIn", url: "https://linkedin.com", icon: FaLinkedin },
      ],
    },
    {
      name: "Octavio Diaz",
      role: "Programmer",
      image: "/images/htph.jpeg",
      links: [
        { platform: "Itch.io", url: "https://itch.io", icon: SiItchdotio },
        { platform: "Twitter", url: "https://twitter.com", icon: FaTwitter },
      ],
    },
    {
      name: "Paul A. Solis",
      role: "Programmer",
      image: "/images/htph.jpeg",
      links: [
        { platform: "GitHub", url: "https://github.com", icon: FaGithub },
        { platform: "Discord", url: "https://discord.com", icon: FaDiscord },
        { platform: "Instagram", url: "https://instagram.com", icon: FaInstagram },
      ],
    },
    {
      name: "Salvador F. Milanés",
      role: "Graphics Programmer",
      image: "/images/htph.jpeg",
      links: [
        { platform: "Github", url: "https://github.com/SFMB-9", icon: FaGithub},
        { platform: "Itch.io", url: "https://firefrog88.itch.io/", icon: SiItchdotio },
        { platform: "LinkedIn", url: "https://www.linkedin.com/in/salvador-federico-milan%C3%A9s-braniff-160631238/", icon: FaLinkedin}
      ],
    },
    {
      name: "Venecia Paz",
      role: "3D Artist",
      image: "/images/htph.jpeg",
      links: [
        { platform: "Instagram", url: "https://instagram.com", icon: FaInstagram },
        { platform: "Itch.io", url: "https://itch.io", icon: SiItchdotio },
      ],
    },
  ];

  return (
    <section
      id="team"
      className="relative w-screen flex flex-col items-center justify-center bg-gray-100 py-6 text-bb"
    >
      {/* Section Title */}
      <h2 className="text-3xl font-raleway font-bold mb-4">Meet the Team</h2>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="relative group flex flex-col items-center text-center bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-transform duration-300 transform hover:scale-105"
          >
            {/* Team Member Image */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden mb-2">
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
            {/* Team Member Info */}
            <h3 className="text-base font-semibold">{member.name}</h3>
            <p className="text-xs text-gray-600">{member.role}</p>

            {/* Link Tree (Hidden by default, visible on hover) */}
            {member.links.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                {member.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-400 transition duration-200 mb-2"
                  >
                    <link.icon size={20} className="inline-block mr-2" />
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
