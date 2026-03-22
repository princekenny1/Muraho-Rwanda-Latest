import { useState, useEffect } from "react";
import { Info, Volume2, Video, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export type HotspotType = "info" | "audio" | "video" | "next-scene" | "landmark";

interface VRHotspotPinProps {
  id: string;
  type: HotspotType;
  title: string;
  isActive?: boolean;
  isQuietMode?: boolean;
  onClick: () => void;
  style?: React.CSSProperties;
}

const hotspotStyles: Record<HotspotType, { bg: string; icon: React.ElementType; iconColor: string }> = {
  info: { 
    bg: "bg-white", 
    icon: Info, 
    iconColor: "text-midnight" 
  },
  audio: { 
    bg: "bg-adventure-green", 
    icon: Volume2, 
    iconColor: "text-white" 
  },
  video: { 
    bg: "bg-terracotta", 
    icon: Video, 
    iconColor: "text-white" 
  },
  "next-scene": { 
    bg: "bg-amber", 
    icon: ChevronRight, 
    iconColor: "text-midnight" 
  },
  landmark: { 
    bg: "bg-muted-indigo", 
    icon: MapPin, 
    iconColor: "text-white" 
  },
};

export function VRHotspotPin({
  id,
  type,
  title,
  isActive = false,
  isQuietMode = false,
  onClick,
  style,
}: VRHotspotPinProps) {
  const [pulsePhase, setPulsePhase] = useState(0);
  const [showLabel, setShowLabel] = useState(false);
  
  const { bg, icon: Icon, iconColor } = hotspotStyles[type];

  // Gentle pulse every 8 seconds
  useEffect(() => {
    if (isQuietMode) return;

    const interval = setInterval(() => {
      setPulsePhase(1);
      setTimeout(() => setPulsePhase(0), 600);
    }, 8000);

    // Initial pulse after mount
    const initialTimeout = setTimeout(() => {
      setPulsePhase(1);
      setTimeout(() => setPulsePhase(0), 600);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [isQuietMode]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group",
        isActive && "scale-125 z-20"
      )}
      style={style}
      aria-label={title}
    >
      {/* Pulse ring animation - every 8 seconds */}
      {!isQuietMode && pulsePhase === 1 && (
        <div 
          className={cn(
            "absolute inset-0 rounded-full animate-ping",
            bg
          )}
          style={{
            animationDuration: "0.6s",
            animationIterationCount: "1",
          }}
        />
      )}

      {/* Active state glow */}
      {isActive && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            transform: "scale(1.8)",
            background: type === "next-scene" 
              ? "radial-gradient(circle, rgba(255, 184, 92, 0.4) 0%, transparent 70%)"
              : type === "audio"
              ? "radial-gradient(circle, rgba(112, 193, 165, 0.4) 0%, transparent 70%)"
              : type === "video"
              ? "radial-gradient(circle, rgba(196, 106, 74, 0.4) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      )}

      {/* Main pin body */}
      <div 
        className={cn(
          "relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300",
          bg,
          isActive && "ring-2 ring-white ring-offset-2 ring-offset-transparent",
          !isQuietMode && "shadow-lg"
        )}
        style={{
          boxShadow: isQuietMode 
            ? "0 2px 8px rgba(0, 0, 0, 0.2)"
            : isActive 
              ? "0 8px 24px rgba(0, 0, 0, 0.4)"
              : "0 4px 16px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>

      {/* Label tooltip */}
      <div 
        className={cn(
          "absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap",
          "px-3 py-2 bg-black/80 backdrop-blur-sm rounded-xl text-white text-sm font-medium",
          "transition-all duration-200 pointer-events-none",
          (isActive || showLabel) && !isQuietMode ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        {title}
        
        {/* Tooltip arrow */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderBottom: "8px solid rgba(0, 0, 0, 0.8)",
          }}
        />
      </div>
    </button>
  );
}
