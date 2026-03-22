import { useEffect, useState } from "react";
import kigaliHero from "@/assets/cover.jpg";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="relative min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px] overflow-hidden"
      style={{
        borderBottomLeftRadius: "48px",
        borderBottomRightRadius: "48px",
        boxShadow: "0px 28px 48px rgba(0,0,0,0.18)",
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={kigaliHero}
          alt="Rwanda's thousand hills at golden hour"
          className="w-full h-full object-cover"
        />

        {/* Triple-layer gradient: Top #0A1A2F 98%, Middle #1B2D40 55%, Bottom warm sand */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              180deg,
              rgba(10, 26, 47, 0.98) 0%,
              rgba(27, 45, 64, 0.55) 45%,
              rgba(228, 201, 168, 0.20) 100%
            )`,
          }}
        />

        {/* Amber glow overlay at 10% */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(
              ellipse at center top,
              rgba(255, 184, 92, 0.12) 0%,
              transparent 60%
            )`,
          }}
        />

        {/* Vignette effect */}
        <div className="hero-vignette absolute inset-0" />

        {/* Imigongo pattern overlay at 3% */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(10,26,47,0.03) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(10,26,47,0.03) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(10,26,47,0.03) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(10,26,47,0.03) 75%)
            `,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6 sm:px-10 lg:px-16 pt-20 pb-16 min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[560px]">
        <p
          className={`text-amber/90 text-sm font-medium tracking-widest uppercase mb-4 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: "100ms",
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          Welcome to Rwanda
        </p>

        <h1
          className={`font-serif font-semibold leading-tight max-w-xs sm:max-w-sm md:max-w-md transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: "200ms",
            fontSize: "clamp(2.5rem, 8vw, 3.25rem)",
            color: "#FAFAFA",
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          Every Hill Has a Memory
        </h1>

        <p
          className={`text-base sm:text-lg mt-5 max-w-[280px] sm:max-w-[380px] md:max-w-[440px] leading-relaxed transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDelay: "300ms",
            color: "rgba(250, 250, 250, 0.75)",
            textShadow: "0 1px 4px rgba(0,0,0,0.15)",
          }}
        >
          Discover stories of resilience, culture, and renewal across the Land
          of a Thousand Hills
        </p>
      </div>
    </section>
  );
}
