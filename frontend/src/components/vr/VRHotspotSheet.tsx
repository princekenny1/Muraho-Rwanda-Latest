import { useState } from "react";
import { X, Play, Pause, ChevronDown, ExternalLink, Volume2, Video, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface HotspotContent {
  id: string;
  type: "info" | "audio" | "video" | "next-scene" | "landmark";
  title: string;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  imageUrl?: string;
  duration?: number;
  sources?: string[];
}

interface VRHotspotSheetProps {
  hotspot: HotspotContent | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (sceneId: string) => void;
}

export function VRHotspotSheet({
  hotspot,
  isOpen,
  onClose,
  onNavigate,
}: VRHotspotSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  if (!hotspot || !isOpen) return null;

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    
    // Simulate playback progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 2;
        });
      }, 100);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const typeIcon = {
    info: <Info className="w-4 h-4" />,
    audio: <Volume2 className="w-4 h-4" />,
    video: <Video className="w-4 h-4" />,
    "next-scene": null,
    landmark: <Info className="w-4 h-4" />,
  };

  return (
    <div 
      className={cn(
        "absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 ease-out",
        isExpanded ? "h-[60%]" : "h-auto"
      )}
    >
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div 
          className="absolute inset-0 -top-[100vh] bg-black/40 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Sheet content */}
      <div 
        className={cn(
          "relative bg-white rounded-t-3xl shadow-modal overflow-hidden",
          "animate-slide-up"
        )}
      >
        {/* Drag handle */}
        <div 
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {typeIcon[hotspot.type] && (
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  hotspot.type === "audio" && "bg-adventure-green/10 text-adventure-green",
                  hotspot.type === "video" && "bg-terracotta/10 text-terracotta",
                  (hotspot.type === "info" || hotspot.type === "landmark") && "bg-muted-indigo/10 text-muted-indigo"
                )}>
                  {typeIcon[hotspot.type]}
                </span>
              )}
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {hotspot.type === "next-scene" ? "Navigation" : hotspot.type}
              </span>
              {hotspot.duration && (
                <span className="text-xs text-muted-foreground">
                  • {formatDuration(hotspot.duration)}
                </span>
              )}
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {hotspot.title}
            </h3>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted-foreground/20 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Preview image */}
        {hotspot.imageUrl && (
          <div className="px-4 pb-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              <img 
                src={hotspot.imageUrl} 
                alt={hotspot.title}
                className="w-full h-full object-cover"
              />
              {hotspot.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <button 
                    onClick={handlePlayPause}
                    className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-midnight" />
                    ) : (
                      <Play className="w-6 h-6 text-midnight ml-1" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {hotspot.description && (
          <div className="px-4 pb-4">
            <p className={cn(
              "text-muted-foreground leading-relaxed",
              !isExpanded && "line-clamp-3"
            )}>
              {hotspot.description}
            </p>
            {!isExpanded && hotspot.description.length > 150 && (
              <button 
                onClick={() => setIsExpanded(true)}
                className="text-primary text-sm font-medium mt-1 flex items-center gap-1"
              >
                Read more
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Audio player */}
        {hotspot.type === "audio" && (
          <div className="px-4 pb-4">
            <div className="bg-adventure-green/10 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePlayPause}
                  className="w-12 h-12 rounded-full bg-adventure-green flex items-center justify-center shadow-md"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="h-1.5 bg-adventure-green/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-adventure-green transition-all duration-100 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(Math.floor((progress / 100) * (hotspot.duration || 60)))}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(hotspot.duration || 60)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sources */}
        {hotspot.sources && hotspot.sources.length > 0 && isExpanded && (
          <div className="px-4 pb-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Sources
            </h4>
            <div className="flex flex-wrap gap-2">
              {hotspot.sources.map((source, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground flex items-center gap-1"
                >
                  {source}
                  <ExternalLink className="w-3 h-3" />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation action */}
        {hotspot.type === "next-scene" && (
          <div className="px-4 pb-6">
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => onNavigate?.(hotspot.id)}
            >
              Go to {hotspot.title}
            </Button>
          </div>
        )}

        {/* Safe area padding */}
        <div className="h-4 safe-area-bottom" />
      </div>
    </div>
  );
}
