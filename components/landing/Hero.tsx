"use client";

const HERO_VIDEO_SRC = "/videos/hero-animation.mp4";

export function Hero() {
  return (
    <section id="inicio" className="relative h-screen w-full overflow-hidden">
      {/* Fallback — same cream as the page so the transition is invisible */}
      <div className="absolute inset-0" style={{ backgroundColor: "#EDE9E1" }} />

      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        onError={(e) => {
          (e.currentTarget as HTMLVideoElement).style.display = "none";
        }}
      >
        <source src={HERO_VIDEO_SRC} type="video/mp4" />
      </video>
    </section>
  );
}
