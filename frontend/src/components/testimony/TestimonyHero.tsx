import { Moon, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonyHeroProps {
  coverImage: string;
  title: string;
  personName: string;
  context: string; // e.g., "April 1994 • Kigali • Survivor"
  isQuietMode: boolean;
  onQuietModeToggle: () => void;
  className?: string;
}

export function TestimonyHero({
  coverImage,
  title,
  personName,
  context,
  isQuietMode,
  onQuietModeToggle,
  className,
}: TestimonyHeroProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Hero Image */}
      <div className="relative h-80 overflow-hidden rounded-b-3xl">
        <img
          src={coverImage}
          alt={`${personName} - ${title}`}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent" />
        
        {/* Quiet Mode Toggle */}
        <button
          onClick={onQuietModeToggle}
          className={cn(
            "absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300",
            isQuietMode
              ? "bg-muted-indigo/40 text-soft-lavender"
              : "bg-white/20 text-white hover:bg-white/30"
          )}
          aria-label={isQuietMode ? "Exit quiet mode" : "Enter quiet mode"}
        >
          {isQuietMode ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Person Name Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-soft-lavender" />
            <span className="text-white/90 text-sm font-medium">{personName}</span>
          </div>

          {/* Title */}
          <h1 className="text-white text-2xl font-semibold leading-tight mb-2 drop-shadow-lg">
            {title}
          </h1>

          {/* Context Line */}
          <p className="text-white/70 text-sm tracking-wide">
            {context}
          </p>
        </div>
      </div>
    </div>
  );
}
