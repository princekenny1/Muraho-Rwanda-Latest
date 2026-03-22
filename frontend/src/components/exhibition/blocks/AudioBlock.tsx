import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioBlockProps {
  title: string;
  speaker?: string;
  duration: string;
  isActive: boolean;
  onClick: () => void;
}

export function AudioBlock({
  title,
  speaker,
  duration,
  isActive,
  onClick,
}: AudioBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-2xl border transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-amber/50",
        isActive
          ? "bg-card border-amber/30 shadow-lg transform -translate-y-1"
          : "bg-card/60 border-border/50 opacity-70 hover:opacity-90"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Play Button */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsPlaying(!isPlaying);
          }}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
            isPlaying 
              ? "bg-amber text-midnight" 
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {title}
            </span>
          </div>
          
          {speaker && (
            <p className="text-xs text-muted-foreground mb-2">
              {speaker}
            </p>
          )}

          {/* Progress */}
          <div className="flex items-center gap-2">
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={1}
              className="flex-1"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-muted-foreground w-12 text-right">
              {duration}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
