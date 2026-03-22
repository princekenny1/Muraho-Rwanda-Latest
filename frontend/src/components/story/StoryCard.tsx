import { Play, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "@/components/ui/bookmark-button";

export type StoryMode = "remembrance" | "culture" | "travel";

interface StoryCardProps {
  id?: string;
  title: string;
  subtitle: string;
  duration: string;
  distance?: string;
  mode: StoryMode;
  imageUrl: string;
  onPlay: () => void;
  onClick: () => void;
}

const modeConfig = {
  remembrance: {
    label: "Remembrance",
    className: "bg-muted-indigo/10 text-muted-indigo",
  },
  culture: {
    label: "Culture",
    className: "bg-terracotta/10 text-terracotta",
  },
  travel: {
    label: "Travel",
    className: "bg-adventure-green/10 text-adventure-green",
  },
};

export function StoryCard({
  id,
  title,
  subtitle,
  duration,
  distance,
  mode,
  imageUrl,
  onPlay,
  onClick,
}: StoryCardProps) {
  const modeStyle = modeConfig[mode];

  return (
    <article
      className="story-card cursor-pointer group animate-on-scroll"
      onClick={onClick}
    >
      {/* Increased image height from 16/10 to 16/12 for more cinematic feel */}
      <div className="relative aspect-[16/12] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/20 to-transparent" />

        {/* Bookmark Button */}
        {id && (
          <div className="absolute top-3 right-3">
            <BookmarkButton
              contentId={id}
              contentType="story"
              title={title}
              imageUrl={imageUrl}
            />
          </div>
        )}

        {/* Play Button - Enhanced with hover animation */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-4 right-4 w-11 h-11 bg-amber rounded-full flex items-center justify-center shadow-card-elevated hover:bg-sunset-gold hover:scale-110 transition-all duration-200"
        >
          <Play className="w-4 h-4 text-midnight fill-midnight ml-0.5" />
        </button>

        {/* Mode Badge - Enhanced */}
        <span
          className={cn(
            "absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border border-white/10",
            modeStyle.className,
          )}
        >
          {modeStyle.label}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {subtitle}
        </p>

        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {duration}
          </span>
          {distance && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {distance}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
