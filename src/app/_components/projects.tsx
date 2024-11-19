'use client'

export default function ProjectsSection() {
  return (
    <section
      className="relative min-h-[50vh] w-screen flex flex-col items-center justify-center bg-gray-900 text-white"
    >
      {/* Anchor */}
      <div
        id="projects"
        className="absolute -top-24" // Offset equal to navbar height (96px = 24rem)
      />
      {/* Section Title */}
      <h2 className="text-4xl font-raleway font-bold mb-8">Projects</h2>

      {/* Carousel-like Container */}
      <div className="relative flex items-center justify-center max-w-4xl w-full">
        {/* Mindaro Project Card */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <h3 className="text-2xl font-semibold mb-4">Mindaro</h3>
          <p className="text-gray-300 mb-6">
            Mindaro is an exciting multiplayer exploration rogue-like that
            challenges players to traverse mysterious, procedurally generated
            worlds filled with danger, puzzles, and adventure.
          </p>
          <button
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded hover:scale-105 shadow-lg transition-transform duration-300"
            onClick={() => alert("Navigate to the Mindaro official page soon!")} // Replace this with a link later
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Placeholder for Future Projects */}
      <p className="text-gray-500 text-sm mt-6">More projects coming soon...</p>
    </section>
  );
}