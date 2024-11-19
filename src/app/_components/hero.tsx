export default function HeroSection() {
  return (
    <section
      className="relative h-screen w-screen flex items-center bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/crater.png')", // Replace with your image
      }}
    >
      <div
        id="hero"
        className="absolute -top-24" // Offset equal to navbar height (96px = 24rem)
      />
      {/* Semi-Transparent Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Left-Aligned and Centered Text */}
      <div className="relative z-2 px-4 font-raleway text-left max-w-lg ml-10">
        <h1 className="text-4xl font-bold mb-4">Our Story</h1>
        <p className="text-sm leading-relaxed">
        Burning Boats Studio was founded by nine passionate developers in Mexico City, brought together by a shared love for gaming and creativity. Each of us brings unique skills to the table—programming, design, art, and sound—all driven by the vision to craft immersive and memorable gaming experiences. As a small indie team, we embrace challenges and push boundaries to tell compelling stories and deliver gameplay that resonates with players. Together, we're building a future where exploration, creativity, and fun come alive in every project.
        </p>
      </div>
    </section>
  );
}
