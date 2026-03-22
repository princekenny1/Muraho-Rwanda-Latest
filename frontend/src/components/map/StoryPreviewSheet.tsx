import { useState } from "react";
import { Play, BookOpen, Heart, Plus, Clock, MapPin, ChevronUp, ChevronDown, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeSwitcher } from "@/components/media/ModeSwitcher";

export type StoryMode = "audio" | "video" | "read";

interface StoryPreviewSheetProps {
  story: {
    id: string;
    title: string;
    coverImage: string;
    duration: string;
    theme: string;
    themeColor: string;
    description: string;
    hasThenNow: boolean;
    distance?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (storyId: string, mode: StoryMode) => void;
  onOpenStory: (storyId: string) => void;
  onSave: (storyId: string) => void;
  onAddToRoute: (storyId: string) => void;
}

export function StoryPreviewSheet({
  story,
  isOpen,
  onClose,
  onPlay,
  onOpenStory,
  onSave,
  onAddToRoute,
}: StoryPreviewSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedMode, setSelectedMode] = useState<StoryMode>("audio");
  const [isSaved, setIsSaved] = useState(false);

  if (!story || !isOpen) return null;

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(story.id);
  };

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        isExpanded ? "h-[60vh]" : "h-[140px]"
      )}
    >
      {/* Handle bar */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-0 left-0 right-0 flex justify-center pt-3 pb-2 cursor-pointer"
      >
        <div className="w-10 h-1 bg-muted rounded-full" />
      </button>

      {/* Expand/Collapse toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </button>

      {/* Content */}
      <div className="px-4 pt-6 pb-6 h-full overflow-hidden">
        {/* Collapsed View */}
        <div className={cn("transition-opacity duration-300", isExpanded && "opacity-0 absolute")}>
          <div className="flex gap-3">
            {/* Cover image - 16:9 thumb */}
            <div 
              className="w-24 h-[54px] rounded-xl bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: `url(${story.coverImage})`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base truncate">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {story.duration}
                </span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${story.themeColor}15`,
                    color: story.themeColor 
                  }}
                >
                  {story.theme}
                </span>
              </div>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onPlay(story.id, selectedMode)}
              className="flex-1 h-10 bg-amber text-midnight rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sunset-gold transition-colors"
            >
              <Play className="w-4 h-4 fill-current" />
              Play
            </button>
            <button
              onClick={() => onOpenStory(story.id)}
              className="h-10 px-4 border-2 border-midnight rounded-xl font-medium text-midnight hover:bg-midnight/5 transition-colors"
            >
              Open Story
            </button>
          </div>
        </div>

        {/* Expanded View */}
        <div className={cn(
          "transition-all duration-300",
          isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <div className="flex gap-4">
            {/* Larger cover image */}
            <div 
              className="w-32 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
              style={{ 
                backgroundImage: `url(${story.coverImage})`,
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)'
              }}
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-semibold text-foreground text-lg">
                {story.title}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {story.duration}
                </span>
                {story.distance && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {story.distance}
                  </span>
                )}
              </div>
              <span 
                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-2"
                style={{ 
                  backgroundColor: `${story.themeColor}15`,
                  color: story.themeColor 
                }}
              >
                {story.theme}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm mt-4 line-clamp-2">
            {story.description}
          </p>

          {/* Nearby microcopy */}
          <p className="text-xs text-adventure-green font-medium mt-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Nearby: A powerful story from this location
          </p>

          {/* Then & Now badge */}
          {story.hasThenNow && (
            <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-amber/10 rounded-lg">
              <Image className="w-4 h-4 text-amber" />
              <span className="text-sm font-medium text-midnight">Then & Now available</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Switch modes anytime</p>
            <ModeSwitcher 
              activeMode={selectedMode} 
              onModeChange={(mode) => setSelectedMode(mode as StoryMode)} 
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onPlay(story.id, selectedMode)}
              className="flex-1 h-12 bg-amber text-midnight rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-sunset-gold transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Play Now
            </button>
            <button
              onClick={handleSave}
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                isSaved 
                  ? "bg-terracotta text-white" 
                  : "border-2 border-midnight text-midnight hover:bg-midnight/5"
              )}
            >
              <Heart className={cn("w-5 h-5", isSaved && "fill-current")} />
            </button>
            <button
              onClick={() => onAddToRoute(story.id)}
              className="h-12 w-12 border-2 border-midnight rounded-xl flex items-center justify-center text-midnight hover:bg-midnight/5 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Tap to listen hint */}
          <p className="text-xs text-center text-muted-foreground mt-3">
            Tap to listen while you're here
          </p>
        </div>
      </div>
    </div>
  );
}
