export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative h-screen w-screen flex items-center bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/crater.png')", // Replace with your image
      }}
    >
      {/* Semi-Transparent Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Left-Aligned and Centered Text */}
      <div className="relative z-2 px-4 font-raleway text-left max-w-lg ml-10">
        <h1 className="text-4xl font-bold mb-4">Our Story</h1>
        <p className="text-sm leading-relaxed">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque bibendum nec ipsum vitae auctor. Vivamus rhoncus vestibulum felis, non maximus tortor gravida nec. Sed id elementum sapien. Nulla vitae lorem sit amet ex aliquet interdum ut ut diam. Proin rutrum fermentum est eu ultricies. Nulla sed neque mauris. Curabitur faucibus urna sit amet ex sagittis, sit amet suscipit leo rutrum. Nulla dictum sit amet orci a sagittis. Mauris in pellentesque est, ut volutpat felis.
        </p>
      </div>
    </section>
  );
}
