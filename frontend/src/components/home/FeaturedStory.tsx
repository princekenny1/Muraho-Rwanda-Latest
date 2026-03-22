import { Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturedStoryProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  mode: "remembrance" | "culture" | "travel";
  onPlay: () => void;
  onClick: () => void;
}

const modeConfig = {
  remembrance: {
    label: "Remembrance",
    className: "bg-muted-indigo/20 text-white border-muted-indigo/30",
  },
  culture: {
    label: "Culture",
    className: "bg-terracotta/20 text-white border-terracotta/30",
  },
  travel: {
    label: "Travel",
    className: "bg-adventure-green/20 text-white border-adventure-green/30",
  },
};

export function FeaturedStory({
  title,
  subtitle,
  imageUrl,
  mode,
  onPlay,
  onClick,
}: FeaturedStoryProps) {
  const modeStyle = modeConfig[mode];

  return (
    <article 
      className="featured-card relative min-h-[300px] aspect-[16/9] cursor-pointer group animate-fade-up"
      onClick={onClick}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-midnight/30 via-transparent to-transparent" />
      </div>

      {/* Featured Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-amber/90 rounded-full">
        <Sparkles className="w-3 h-3 text-midnight" />
        <span className="text-xs font-semibold text-midnight">Today's Featured</span>
      </div>

      {/* Mode Badge */}
      <span className={cn(
        "absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
        modeStyle.className
      )}>
        {modeStyle.label}
      </span>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-serif text-xl font-semibold text-white leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-white/70 mt-1 line-clamp-1">
          {subtitle}
        </p>
      </div>

      {/* Play Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        className="absolute bottom-4 right-4 w-12 h-12 bg-amber rounded-full flex items-center justify-center shadow-hero hover:bg-sunset-gold hover:scale-105 transition-all duration-200"
      >
        <Play className="w-5 h-5 text-midnight fill-midnight ml-0.5" />
      </button>

      {/* Subtle border */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />
    </article>
  );
}
