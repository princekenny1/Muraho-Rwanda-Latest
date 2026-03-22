import { useState } from "react";
import { X, Play, ChevronRight, MapPin, Clock, Filter, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface BundledStory {
  id: string;
  title: string;
  duration: string;
  theme: string;
  themeColor: string;
  distance: string;
  coverImage: string;
  emotionalTone?: "intense" | "inspiring" | "historical" | "peaceful";
}

interface NotificationBundleProps {
  stories: BundledStory[];
  isOpen: boolean;
  areaName?: string;
  onClose: () => void;
  onPlayStory: (storyId: string) => void;
  onPlayAll: () => void;
}

const toneLabels: Record<string, { label: string; color: string }> = {
  intense: { label: "Intense", color: "bg-muted-indigo" },
  inspiring: { label: "Inspiring", color: "bg-adventure-green" },
  historical: { label: "Historical", color: "bg-terracotta" },
  peaceful: { label: "Peaceful", color: "bg-sky-blue" },
};

export function NotificationBundle({
  stories,
  isOpen,
  areaName = "this area",
  onClose,
  onPlayStory,
  onPlayAll,
}: NotificationBundleProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"distance" | "duration" | "popularity">("distance");

  if (!isOpen) return null;

  const filteredStories = activeFilter
    ? stories.filter((s) => s.emotionalTone === activeFilter)
    : stories;

  const sortedStories = [...filteredStories].sort((a, b) => {
    if (sortBy === "distance") {
      return parseFloat(a.distance) - parseFloat(b.distance);
    }
    if (sortBy === "duration") {
      return parseInt(a.duration) - parseInt(b.duration);
    }
    return 0;
  });

  const totalDuration = stories.reduce((acc, s) => acc + parseInt(s.duration), 0);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-midnight/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber" />
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Stories Nearby
                </h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                You're entering {areaName} with {stories.length} stories
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              {totalDuration} min total
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {stories.length} locations
            </span>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveFilter(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                !activeFilter
                  ? "bg-amber text-midnight"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              All
            </button>
            {Object.entries(toneLabels).map(([key, { label }]) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  activeFilter === key
                    ? "bg-amber text-midnight"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Story list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-3">
            {sortedStories.map((story, index) => (
              <button
                key={story.id}
                onClick={() => onPlayStory(story.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
              >
                {/* Cover image */}
                <div 
                  className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0 relative overflow-hidden"
                  style={{ backgroundImage: `url(${story.coverImage})` }}
                >
                  <div className="absolute inset-0 bg-midnight/0 group-hover:bg-midnight/40 transition-colors flex items-center justify-center">
                    <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">
                    {story.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.duration}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {story.distance}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${story.themeColor}15`,
                        color: story.themeColor 
                      }}
                    >
                      {story.theme}
                    </span>
                    {story.emotionalTone && (
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        toneLabels[story.emotionalTone]?.color
                      )} />
                    )}
                  </div>
                </div>

                {/* Index */}
                <div className="w-8 h-8 rounded-full bg-midnight/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-foreground">{index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-4 py-4 border-t border-border bg-white safe-area-bottom">
          <button
            onClick={onPlayAll}
            className="w-full h-12 bg-amber text-midnight rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sunset-gold transition-colors"
          >
            <Play className="w-5 h-5 fill-current" />
            Play All ({stories.length} stories)
          </button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            Auto-plays stories as you explore
          </p>
        </div>
      </div>
    </div>
  );
}
