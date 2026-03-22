import { RotateCcw, Moon, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VRControlsProps {
  isMuted: boolean;
  isFullscreen: boolean;
  isQuietMode: boolean;
  onMuteToggle: () => void;
  onFullscreenToggle: () => void;
  onQuietModeToggle: () => void;
  onResetView: () => void;
  onClose: () => void;
}

export function VRControls({
  isMuted,
  isFullscreen,
  isQuietMode,
  onMuteToggle,
  onFullscreenToggle,
  onQuietModeToggle,
  onResetView,
  onClose,
}: VRControlsProps) {
  return (
    <div className="absolute top-0 left-0 right-0 safe-area-top z-10">
      <div className="flex items-center justify-between p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          aria-label="Close virtual tour"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Reset view */}
          <button
            onClick={onResetView}
            className={cn(
              "w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors",
              "hover:bg-black/60"
            )}
            aria-label="Reset view"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Quiet mode */}
          <button
            onClick={onQuietModeToggle}
            className={cn(
              "w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all",
              isQuietMode 
                ? "bg-muted-indigo text-white" 
                : "bg-black/50 text-white hover:bg-black/60"
            )}
            aria-label={isQuietMode ? "Disable quiet mode" : "Enable quiet mode"}
          >
            <Moon className={cn("w-5 h-5", isQuietMode && "fill-current")} />
          </button>

          {/* Mute toggle */}
          <button
            onClick={onMuteToggle}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={onFullscreenToggle}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Quiet mode indicator */}
      {isQuietMode && (
        <div className="flex justify-center -mt-2 animate-fade-in">
          <div className="px-3 py-1 bg-muted-indigo/80 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
            <Moon className="w-3 h-3 fill-current" />
            Quiet Mode Active
          </div>
        </div>
      )}
    </div>
  );
}
