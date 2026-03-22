import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Subtitles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoBlockProps {
  title: string;
  duration: string;
  thumbnailUrl: string;
  hasClosedCaptions: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function VideoBlock({
  title,
  duration,
  thumbnailUrl,
  hasClosedCaptions,
  isActive,
  onClick,
}: VideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);

  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-amber/50",
        isActive
          ? "border-amber/30 shadow-lg transform -translate-y-1"
          : "border-border/50 opacity-70 hover:opacity-90"
      )}
    >
      {/* Video Thumbnail/Player */}
      <div className="relative aspect-video bg-midnight">
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-midnight/40">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaying(true);
              }}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </button>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-midnight/80 text-white text-xs">
          {duration}
        </div>

        {/* CC Badge */}
        {hasClosedCaptions && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded bg-midnight/80 text-white text-xs flex items-center gap-1">
            <Subtitles className="w-3 h-3" />
            CC
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="p-3 bg-card flex items-center justify-between">
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {title}
        </span>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          {hasClosedCaptions && (
            <Button
              variant={showCaptions ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setShowCaptions(!showCaptions);
              }}
            >
              <Subtitles className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
