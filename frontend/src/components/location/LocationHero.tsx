import { ArrowLeft, Heart, Share2, Baby } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThenNowSlider } from "@/components/story/ThenNowSlider";
import type { ExperienceMode } from "./ChooseYourPath";

interface LocationHeroProps {
  title: string;
  subtitle?: string;
  coverImage: string;
  hasThenAndNow?: boolean;
  thenImage?: string;
  nowImage?: string;
  thenLabel?: string;
  nowLabel?: string;
  mode?: ExperienceMode;
  onBack?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
}

export function LocationHero({
  title,
  subtitle,
  coverImage,
  hasThenAndNow = false,
  thenImage,
  nowImage,
  thenLabel = "Then",
  nowLabel = "Now",
  mode = "standard",
  onBack,
  onSave,
  onShare,
  isSaved = false,
}: LocationHeroProps) {
  const showThenAndNow = hasThenAndNow && thenImage && nowImage;

  // Mode-specific overlays
  const modeOverlays: Record<ExperienceMode, string> = {
    standard: "from-midnight/60 via-midnight/30 to-transparent",
    "personal-voices": "from-muted-indigo/70 via-muted-indigo/30 to-transparent",
    "kid-friendly": "from-sky-500/50 via-sky-400/20 to-transparent",
  };

  return (
    <div className="relative">
      {/* Header Actions */}
      <header className="fixed top-0 left-0 right-0 z-40 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 page-content-narrow">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-midnight" />
          </button>
          <div className="flex gap-2">
            {onSave && (
              <button
                onClick={onSave}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Heart
                  className={cn(
                    "w-5 h-5",
                    isSaved ? "fill-terracotta text-terracotta" : "text-midnight"
                  )}
                />
              </button>
            )}
            {onShare && (
              <button
                onClick={onShare}
                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <Share2 className="w-5 h-5 text-midnight" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Image or Then & Now Slider */}
      <div className="pt-14">
        {showThenAndNow ? (
          <div className="px-4">
            <ThenNowSlider
              thenImage={thenImage}
              nowImage={nowImage}
              thenLabel={thenLabel}
              nowLabel={nowLabel}
            />
          </div>
        ) : (
          <div className="relative h-64 sm:h-80">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t",
                modeOverlays[mode]
              )}
            />

            {/* Kid Mode Badge */}
            {mode === "kid-friendly" && (
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber text-midnight">
                <Baby className="w-4 h-4" />
                <span className="text-sm font-semibold">Kid-Friendly</span>
              </div>
            )}

            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h1
                className={cn(
                  "font-serif text-2xl font-semibold text-white drop-shadow-lg",
                  mode === "kid-friendly" && "text-3xl"
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/80 mt-1 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
