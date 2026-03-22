import { Play, Pause, X, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniPlayerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  isPlaying: boolean;
  progress: number;
  onPlayPause: () => void;
  onClose: () => void;
  onExpand: () => void;
}

export function MiniPlayer({
  title,
  subtitle,
  imageUrl,
  isPlaying,
  progress,
  onPlayPause,
  onClose,
  onExpand,
}: MiniPlayerProps) {
  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 animate-slide-up">
      <div className="bg-midnight mx-2 rounded-xl shadow-player overflow-hidden">
        {/* Progress Bar */}
        <div className="h-0.5 bg-midnight/50">
          <div 
            className="h-full bg-sunset-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center p-3 gap-3">
          {/* Thumbnail */}
          <button 
            onClick={onExpand}
            className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group"
          >
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-midnight/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronUp className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Info */}
          <button 
            onClick={onExpand}
            className="flex-1 text-left min-w-0"
          >
            <h4 className="text-sm font-medium text-white truncate">
              {title}
            </h4>
            <p className="text-xs text-white/60 truncate">
              {subtitle}
            </p>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-amber flex items-center justify-center hover:bg-sunset-gold transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 text-midnight fill-midnight" />
              ) : (
                <Play className="w-4 h-4 text-midnight fill-midnight ml-0.5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
