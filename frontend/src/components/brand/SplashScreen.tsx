import { useEffect, useState } from "react";
import { AppIcon } from "@/components/brand";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, duration - 300);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-midnight transition-opacity duration-300",
        isFading && "opacity-0"
      )}
    >
      {/* Centered MR Icon */}
      <div className="animate-scale-in">
        <AppIcon size="xl" />
      </div>

      {/* Brand Text */}
      <h1 className="mt-6 font-sans text-2xl font-semibold tracking-wide text-cloud-mist animate-fade-up">
        Muraho Rwanda
      </h1>

      {/* Subtle tagline */}
      <p className="mt-2 text-sm text-cloud-mist/60 animate-fade-up" style={{ animationDelay: "100ms" }}>
        Discover Rwanda's stories
      </p>

      {/* Loading indicator */}
      <div className="absolute bottom-12 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-amber animate-bounce-subtle"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
